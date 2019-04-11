'use strict'
var util = require('util')
var winston = require('winston')
var Knex = require('knex')
var Bookshelf = require('bookshelf')
var Q = require('q')
var AsyncLock = require('async-lock')

/**
 * Expose `SQLite3`
 */

module.exports = SQLite3

/**
 * Expose the name of this Transport on the prototype
 */
SQLite3.prototype.name = 'sqlite3'

const dummyLock = new AsyncLock();

/**
 * Initialize a `SQLite` transport object with the given `options`.
 *
 * Events:
 *
 *  - `error` an error occurred
 *  - `stream` file streaming has started
 *  - `end` streaming has completed
 *  - `directory` a directory was requested
 *
 * @param {Request} req
 * @param {String} path
 * @param {Object} options
 * @api private
 */

function SQLite3(options) {
  options = options || {}

  winston.Transport.call(this, options)

  this.name = 'sqlite3'
  this.database = options.database === null ? null : (options.database || 'winston')
  this.user = options.user === null ? null : (options.user || 'winston')
  this.password = options.password === null ? null : (options.password || null)
  this.filename = options.filename || ':memory:'
  this.tableName = options.tableName || 'Entry'
  this.dbLock = options.dbLock || dummyLock;
  this.dbLockName = options.dbLockName || 'dblock';
}

/**
 * Inherits from `winston.Transport`.
 */
util.inherits(SQLite3, winston.Transport)

/**
 * Define a getter so that `winston.transports.SQLite`
 * is available and thus backwards compatible.
 */
winston.transports.SQLite3 = SQLite3

/**
 * Core Winston logging method.
 *
 * @param {String} level to log at
 * @param {String} message to log
 * @param {object} metadata to attach to the messages
 * @param {Function} callback to respond to when complete
 * @api public
 */
SQLite3.prototype.log = async function (level, msg, meta, callback) {
  if (this.silent) {
    return callback && callback(null, true)
  }
  var self = this

  var params = {}

  params.timestamp = new Date()
  params.message = msg
  params.level = level

  delete meta.level //remove the level and message from the meta object
  delete meta.message

  params.meta = JSON.stringify(meta || {})

  this.dbLock.acquire(this.dbLockName, function (done) {
    self.client.forge(params).save(null, null).then((result) => {
      if (!result) {
        self.emit('error')
        return done(new Error, null);
      }
      self.emit('logged')
      return done(null, result);
    });
  }, function (err, ret) {
    // Lock released here
  });
}

/**
 *
 */
SQLite3.prototype._ensureClient = function () {
  if (this._client) {
    return this._client
  }

  var knex = Knex({
    client: 'sqlite3',
    connection: {
      database: this.database,
      user: this.user,
      password: this.password,
      filename: this.filename,
		},
  })

  Q.allSettled([
    knex.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments()
      table.date('timestamp')
      table.string('level')
      table.string('message')
      table.string('meta')
    }),
  ])

  var bookshelf = Bookshelf(knex)

  var Entry = bookshelf.Model.extend({
    tableName: this.tableName,
  })
  this._client = Entry

  return this._client
}

SQLite3.prototype.__defineGetter__('client', function () {
  return this._ensureClient()
})

/**
 *
 */

/**
 * Winston transport query method.
 *
 * @param {Object} query options
 * @param {Function} callback to respond to when complete
 * @api public
 */
SQLite3.prototype.query = function (options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  var self = this,
    query = {}
}

/**
 * Winston transport stream method; uses polling.
 *
 * @param {Object} query options
 * @param {Object} pre-existing stream
 * @return {Object} stream
 * @api public
 */
SQLite3.prototype.stream = function (options, stream) {
  return stream
}
