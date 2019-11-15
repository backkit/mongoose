const mongoose = require('mongoose');

class MongooseService {
  constructor({appdir, config, logger}) {
    const mconf = config.get('mongoose');
    this.mongoose = mongoose;
    this.models = {};
    this.schemas = {};
    this.appdir = appdir;
    this.connectUrl = `mongodb://${mconf.host}:${mconf.port}/${mconf.db}`;
    this.options = {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      promiseLibrary: global.Promise,
      poolSize: 4,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    };
    if (mconf.user) this.options.user = mconf.user;
    if (mconf.pass) this.options.pass = mconf.pass;

    // only connect if a runnable service is set
    // otherwise it will prevent process from exit
    if (process.env.ENTRYPOINT) {
      mongoose.connect(this.connectUrl, this.options);
    }
    this.connection = mongoose.connection;

    // subscribers to first successful connection event
    this.onReadySubscribers = [];

    // Emitted when an error occurs on this this.connection.
    this.connection.on('error', (err) => {
      logger.error(`mongoose error`, {
        err: err.message,
        stack: err.stack
      });
    });

    // Emitted when this connection successfully connects to the db. May be emitted multiple times in reconnected scenarios.
    this.connection.on('connecting', () => {
      logger.info(`mongoose connecting to ${this.connectUrl} ...`);
    });

    // Emitted after we connected and onOpen is executed on all of this connections models.
    this.connection.once('open', () => {
      logger.info(`mongoose connected to ${this.connectUrl}`);
      this.onReadySubscribers.forEach(f => f());
    });

    // Emitted when this.connection.close() was executed.
    this.connection.on('disconnecting', () => {
      logger.info(`mongoose disconnecting from ${this.connectUrl} ...`);
    });

    // Emitted after getting disconnected from the db.
    this.connection.on('disconnected', () => {
      logger.info(`mongoose disconnected from ${this.connectUrl}`);
    });

    // Emitted after we disconnected and onClose executed on all of this connections models..
    this.connection.on('close', () => {
      logger.info(`mongoose disconnected from ${this.connectUrl} (2)`);
    });

    // Emitted after we connected and subsequently disconnected, followed by successfully another successfull this.connection.
    this.connection.on('reconnected', () => {
      logger.info(`mongoose reconnected to ${this.connectUrl}`);
    });

    // Emitted in a replica-set scenario, when primary and at least one seconaries specified in the connection string are connected
    this.connection.on('fullsetup', () => {
      logger.info(`Emitted in a replica-set scenario, when primary and at least one seconaries specified in the connection string are connected`);
    });

    // Emitted in a replica-set scenario, when all nodes specified in the connection string are connected.
    this.connection.on('all', () => {
      logger.info(`Emitted in a replica-set scenario, when all nodes specified in the connection string are connected.`);
    });
  }

  /**
   * Subscribe to successful connection
   *
   * @param {Function} _cb
   */
  onReady(_cb) {
    const addReadyListener = (_cb) => {
      this.onReadySubscribers.push(_cb);
    }; 
  }

  /**
   * DI for models
   */
  register() {
    const base = `${this.appdir}/res/mongoose`;
    return require('fs').readdirSync(base).filter(file => file.endsWith('.js')).map(file => `${base}/${file}`);
  }
}

module.exports = MongooseService;