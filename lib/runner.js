const ora = require('ora')

module.exports = function (args) {
  const cmd = args._[0]
  let stage
  let spinner = ora(`Loading command '${cmd}'`).start()

  try {
    stage = 'loading'
    let command = require('../cmd/' + cmd)
    spinner.succeed(`Loaded command '${cmd}'`)

    stage = 'executing'
    spinner.start(`Executing command '${cmd}'`)
    command.main(args, err => {
      if (err) {
        spinner.fail(`Failed command '${cmd}': ${err}`)
        process.exit(err.exitStatus || 3)
      } else {
        spinner.succeed(`Command '${cmd}' executed successfuly`)
      }
    })
  } catch (err) {
    if (stage === 'loading') {
      spinner.fail(`Command '${cmd}' doesn't exists!`)
      process.exit(1)
    } else if (stage === 'executing') {
      spinner.fail(`Exception not handled at command '${cmd}': ${err}`)
      process.exit(2)
    }
  }
}
