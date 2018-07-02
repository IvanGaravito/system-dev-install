/*
    Base class for commands
*/
const {basename} = require('path')

function Command (opts) {
  if (this === null) {
    return new Command(opts)
  }
  this.name = opts.name || basename(__filename, '.js')
  this.description = opts.description || 'Not defined'
  this.requireSudo = opts.requireSudo || false

  /*
    Entry point for Command instance. Needs to be modified!

    args  Arguments to pass to command
    cb    Notify callback (err) => {} where err is an Error instance and can
          have an exitStatus attribute
  */
  this.main = opts.main || ((args, cb) => 1)
}

module.exports = Command
