import Net from 'net';
import Store from './store';
import { Parser } from './parser';
import ParserError from './parser_error';
import StoreError from './store_error';
import MemoryTracker from './memory_tracker';
import CorvoEvictionPolicy from './corvo_eviction_policy';
import FS from "fs";

const DEFAULT_PORT = 6379;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const DEFAULT_EVICTION_POLICY = "lru";

const WRITE_COMMANDS = {
  SET: true, // always write to AOF
  APPEND: true, // always write to AOF when returning integer
  TOUCH: true, // write to AOF when return val integer NOT 0 X
  INCR: true, // always write to AOF when returning integer
  DECR: true, // always write to AOF when returning integer
  RENAME: true, // write to AOF when returning OK
  RENAMENX: true, // write to AOF when returns 1 or 0
  DEL: true, // write for any integer greater than 0 X
  LREM: true, // write for any integer greater than 0 X
  LPUSH: true, // write for any integer value
  RPUSH: true, // write for any integer value
  LPOP: true, // write when not nil X
  RPOP: true, // write when not nil X
  LSET: true, // write when returning OK
};
const DEF_OPTIONS = {
  maxMemory: DEFAULT_MAX_MEMORY,
  aofWritePath: 'corvoAOF.aof',
  aofPersistence: true,
  evictionPolicy: DEFAULT_EVICTION_POLICY,
};

class CorvoServer {
  constructor(options=DEF_OPTIONS) {
    this.store = new Store(options["maxMemory"] || DEFAULT_MAX_MEMORY,
                           options["evictionPolicy"] || DEFAULT_EVICTION_POLICY);
    this.storeCommandMap = {
      'GET': this.store.getString,
      'APPEND': this.store.appendString,
      'STRLEN': this.store.getStrLen,
      'TOUCH': this.store.touch,
      'INCR': this.store.strIncr,
      'DECR': this.store.strDecr,
      'EXISTS': this.store.exists,
      'RENAME': this.store.rename,
      'RENAMENX': this.store.renameNX,
      'TYPE': this.store.type,
      'DEL': this.store.del,
      'LINDEX': this.store.lindex,
      'LREM': this.store.lrem,
      'LLEN': this.store.llen,
      'LPUSH': this.store.lpush,
      'RPUSH': this.store.rpush,
      'LPOP': this.store.lpop,
      'RPOP': this.store.rpop,
      'LSET': this.store.lset,
    };
    this.aofWritePath = options["aofWritePath"] ? options.aofWritePath : DEF_OPTIONS.aofWritePath;
    this.persist = options["aofPersistence"] ? options.aofPersistence : DEF_OPTIONS.aofPersistence;
    if (this.persist) {
      this.writer = FS.createWriteStream(this.aofWritePath, {'flags': 'a' });
    }

    this.connections = [];
  }

  prepareRespReturn(result, isError=false) {
    // handle error
    if (isError) {
      return "-" + result + "\r\n";
    }

    // handle null
    if (result === null) {
      return "$-1\r\n";
    }

    // handle array
    if (result instanceof Array) {
      let respResult = "*" + result.length + "\r\n";

      result.forEach((elem) => {
        if (elem === null) {
          respResult += "$-1\r\n";
        } else if (typeof elem === 'string') {
          respResult += "$" + elem.length + "\r\n" + elem + "\r\n";
        } else if (typeof elem === 'number') {
          respResult += ":" + elem + "\r\n";
        }
      });

      return respResult;
    }

    // handle string
    if (typeof result === 'string') {
      let respResult;
      if (result.length === 0) {
        respResult = "$0\r\n\r\n";
      } else {
        respResult = "+" + result + "\r\n";
      }

      return respResult;
    }

    // handle number
    if (typeof result === 'number') {
      return ":" + result + "\r\n";;
    }

  }

  startServer(port=DEFAULT_PORT, host=DEFAULT_HOST) {
    this.server = Net.createServer();
    this.server.on('connection', this.handleConnection.bind(this));

    if (this.persist) { this.aofLoadFile(this.aofWritePath); }
    const self = this;
    this.server.listen(port, host, function() {
      console.log('server listening to %j', self.server.address());
    });
  }

  handleConnection(conn) {
    this.connections.push(conn);
    const self = this;
    conn.setEncoding('utf8');
    conn.on('data', function(data) {
      console.log("data =", data);
      try {
        const tokens = Parser.processIncomingString(data);
        const command = tokens[0].toUpperCase();
        let result;

        if (command === 'SHUTDOWN') {
          this.shutdownServer();
        } else if (command === 'SET') {
          if (tokens.length > 3) {
            // add code to accommodate expiry later
            const flag = tokens[tokens.length - 1];

            if (flag === 'NX') {
              result = this.store.setStringNX(...tokens.slice(1));
            } else if (flag === 'XX') {
              result = this.store.setStringX(...tokens.slice(1));
            }
          } else {
            result = this.store.setString(...tokens.slice(1));
          }
        } else if (command === 'LINSERT') {
          const flag = tokens[2];

          if (flag === 'BEFORE') {
            result = this.store.linsertBefore(...tokens.slice(1));
          } else if (flag === 'AFTER') {
            result = this.store.linsertAfter(...tokens.slice(1));
          }

        } else if (this.storeCommandMap[command]) {
          result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
        } else {
          result = "ServerError: Command not found in storeCommandMap.";
        }

        // write to AOF file if command and return val are correct
        if (WRITE_COMMANDS[command]) {
          if (this.persist) {
            this.aofCheckAndWrite(data, command, result);
          }
        }

        const stringToReturn = this.prepareRespReturn(result);
        if (command !== 'SHUTDOWN') {
          conn.write(stringToReturn);
        }
      } catch(err) {
        if (err instanceof ParserError || err instanceof StoreError) {
          const stringToReturn = this.prepareRespReturn(err.message, true);
          conn.write(stringToReturn);
        } else {
          throw err;
        }
      }
    }.bind(this));
  };

  aofCheckAndWrite(data, command, result) {
    if (command === 'TOUCH' && result === 0) {
      return;
    } else if (command === 'DEL' && result === 0) {
      return;
    } else if (command === 'LPOP' && result === null) {
      return;
    } else if (command === 'RPOP' && result === null) {
      return;
    } else if (command === 'LREM' && result === 0) {
      return;
    } else {
      this.writer.write(data, 'UTF8');
    }
  }

  aofLoadFile(fileName) {
    const CHUNK_SIZE = 1024;

    const self = this;
    this.prependString = "";
    const readStream = FS.createReadStream(fileName, {encoding: 'utf8', highWaterMark: CHUNK_SIZE});
    readStream.on('data', function(chunk) {
          let bytes = chunk.length;
          let dataToProcess;

          const dataReceived = chunk;
          if (bytes < CHUNK_SIZE) {
            dataToProcess = self.prependString + dataReceived;
          } else {
            const bytesToChop = self.getTrailingCommandBytes(dataReceived);
            dataToProcess = self.prependString + dataReceived.slice(0, -bytesToChop);
            self.prependString = dataReceived.slice(-bytesToChop);
          }
          let inputDataTokens = dataToProcess.split('\r\n').slice(0, -1);
          while (inputDataTokens.length) {
            let countToken = inputDataTokens.shift();
            let count = parseInt(countToken.slice(1), 10);
            // extract one command
            let tokens = self.extractOneCommand(count, inputDataTokens);

            // apply that command
            self.aofCallStoreCommands(tokens);
          }
      }).on('end', function() {
      });
  }

  getTrailingCommandBytes(dataReceived) {
    let count = 0;
    let idx = dataReceived.length - 1;

    while (idx >= 0) {
      count += 1;
      if (dataReceived[idx] === '*') {
        return count;
      }
      idx -= 1;
    }
  }

  extractOneCommand(count, inputDataTokens) {
    const tokens = [];
    for (let i = 0; i < count; i += 1) {
      inputDataTokens.shift();
      tokens.push(inputDataTokens.shift());
    }

    return tokens;
  }

  aofCallStoreCommands(tokens) {
    try {
      const command = tokens[0].toUpperCase();
      let result;

      if (command === 'SET') {
        console.log("TOKENS", tokens);
        if (tokens.length > 3) {
          // add code to accommodate expiry later
          const flag = tokens[tokens.length - 1];

          if (flag === 'NX') {
            result = this.store.setStringNX(...tokens.slice(1));
          } else if (flag === 'XX') {
            result = this.store.setStringX(...tokens.slice(1));
          }
        } else {
          result = this.store.setString(...tokens.slice(1));
        }
      } else if (command === 'LINSERT') {
        console.log("TOKENS", tokens);
        const flag = tokens[2];

        if (flag === 'BEFORE') {
          result = this.store.linsertBefore(...tokens.slice(1));
        } else if (flag === 'AFTER') {
          result = this.store.linsertAfter(...tokens.slice(1));
        }

      } else if (this.storeCommandMap[command]) {
        console.log("TOKENS", tokens);
        result = this.storeCommandMap[command].apply(this.store, tokens.slice(1));
      } else {
        result = "ServerError: Command not found in storeCommandMap.";
      }

    } catch(err) {
      throw err;
    }
  }

  static parseCommandLineIntoOptions(args) {
    const options = {};

    while (args.length) {
      const token = args.shift();
      if (token === '--maxMemory') {
        const maxMemory = +args.shift();

        if (isNaN(maxMemory)) {
          throw new Error("Invalid option value for maxMemory.");
        }

        options['maxMemory'] = maxMemory;
      } else if (token === '--aofWritePath') {
        const path = args.shift();

        if (!path.match(/.+\.aof$/i)) {
          throw new Error("Invalid option value for aofWritePath.");
        }

        options['aofWritePath'] = path
      } else if (token === '--aofPersistence') {
        let persistenceBool = args.shift();

        if (persistenceBool !== 'true' && persistenceBool !== 'false') {
          throw new Error("Invalid option value for aofPersistence.");
        }

        persistenceBool = persistenceBool === 'true';

        options['aofPersistence'] = persistenceBool;
      } else if (token === '--evictionPolicy') {
        const policy = args.shift();

        if (policy !== 'lru') {
          throw new Error("Invalid option value for evictionPolicy.");
        }

        options['evictionPolicy'] = policy;
      }
    };

    return options;
  }

  shutdownServer() {
    console.log("shutting down server...");
    this.connections.forEach((conn) => {
      conn.destroy();
    });
    this.server.close();
  }
}

export default CorvoServer;
