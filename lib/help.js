const chalk = require('chalk')

module.exports = function () {
  const {name, description} = require('../package.json')
  const commands = require('./commands')

  commands((err, cmds) => {
    let text

    text = chalk.cyan.bold(name) + ' - ' + chalk.white(description) + '\n\n'
    text = text + chalk.white.bold('USAGE') + '\n\n'
    text = text + '\t' + chalk.white.italic(name) + ' ' + chalk.magenta('<command>') + ' ' + chalk.yellow('[options]') + '\n\n'
    text = text + chalk.white.bold('COMMANDS') + '\n\n'

    if (err) {
      text = text + `Can't list commands because of ${err}\n\n`
    } else if (cmds.length === 0) {
      text = `${text}No commands found!\n\n`
    } else {
      text = text + chalk.blue.bold('Sudo\tName\t\tDescription') + '\n'
      text = text + chalk.blue('----\t----\t\t-----------') + '\n'
      cmds.forEach(command => {
        text = text + (command.requireSudo ? chalk.green(' ✔') : chalk.red(' ✖')) + '\t' + chalk.magenta(command.name) + '\t\t' + chalk.white(command.description) + '\n'
      })
      text = text + '\n'
    }
    text = text + chalk.white.bold('GLOBAL OPTIONS') + '\n\n'
    text = text + chalk.yellow('--help, -h') + '\t\t' + chalk.white('Show this help and exit') + '\n'
    text = text + chalk.yellow('--version, -v') + '\t\t' + chalk.white('Show version and exit') + '\n'
    console.log(text)
  })
}
