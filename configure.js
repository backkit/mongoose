const autoconf = require("@backkit/autoconf");

autoconf('mongoose')
.generator(self => ([
  {
    putFileOnce: self.serviceConfigMainYML,
    contentYml: self.config
  },
  {
    putFileOnce: self.serviceCodeMainJS,
    content: `module.exports = require('${self.npmModuleName}');`
  },
  {
    putFileOnce: `${self.serviceResourceDir}/.gitkeep`
  }
]))
.default(self => ({
  host: "localhost",
  port: 27017,
  db: 'test'
}))
.prompt(self => ([
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'host',
    message: "mongoDB host",
    default: self.defaultConfig.host,
    validate: function(value) {
      return true;
    }
  },
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'port',
    message: "mongoDB port",
    default: self.defaultConfig.port,
    filter: function(value) {
      return ~~(value);
    },
    validate: function(value) {
      return ~~(value) > 0;
    }
  },
  {
    if: {
      fileNotFound: self.serviceConfigMainYML
    },
    type: 'input',
    name: 'db',
    message: "mongoDB database name",
    default: self.defaultConfig.db,
    validate: function(value) {
      return true;
    }
  }
]))
.run()
