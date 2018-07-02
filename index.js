const minimist = require('minimist')

module.exports = () => {
  const args = minimist(process.argv.slice(2))

  // Command
  let cmd = args._[0] || 'help'

  // Default arguments that are commands
  if (args._.length === 0 && (args.help || args.h)) {
    cmd = 'help'
  }
  if (args.version || args.v) {
    cmd = 'version'
  }

  switch (cmd) {
    case 'help':
      require('./lib/help')()
      break
    case 'version':
      require('./lib/version')()
      break
    default:
      require('./lib/runner')(args)
  }
}
