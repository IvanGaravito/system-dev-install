const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs git prompt for bash',
  requireSudo: false
})

module.exports.main = function (args, cb) {
  // Needs be run as root
  if (module.exports.requireSudo && !this.isRoot()) {
    let err = new Error('Need root permissions')
    err.exitStatus = 3
    return cb(err)
  }

  /*
    Source: https://gist.github.com/IvanGaravito/be3bcaaebfa0de5ed4857232e9243b97
    Commands:
  */

  const fs = require('fs')
  const os = require('os')
  const {promisify} = require('util')
  const execa = require('execa')
  const Listr = require('listr')
  const shell = require('shelljs')
  const got = require('got')

  const writeFile = promisify(fs.writeFile)
  const readFile = promisify(fs.readFile)

  const tasks = new Listr([
    {
      title: 'Looking local installation',
      task: (ctx, task) => {
        // Looks if already installed
        const binDir = ctx.binDir = join(os.homedir(), 'bin')
        const promptFile = ctx.promptFile = join(binDir, '.prompt.sh')

        ctx.alreadyInstalled = shell.test('-d', binDir) && shell.test('-f', promptFile)
        if (ctx.alreadyInstalled) return

        // Creates ~/bin directory if not exists and enters it
        if (!shell.test('-d', binDir)) {
          shell.mkdir(binDir)
        }
        process.chdir(binDir)
      }
    },
    {
      title: 'Installing git prompt for bash',
      skip: ctx => ctx.alreadyInstalled && 'Git prompt already installed',
      task: (ctx, task) => {
        const gitPromptDir = '.bash-git-prompt'
        return new Listr([
          {
            title: 'Cloning https://github.com/magicmonty/bash-git-prompt.git repository',
            task: () => execa('git', ['clone', '--depth', '1', 'https://github.com/magicmonty/bash-git-prompt.git', gitPromptDir])
          },
          {
            title: 'Downloading My Bash prompt script',
            task: () => got('https://gist.githubusercontent.com/IvanGaravito/be3bcaaebfa0de5ed4857232e9243b97/raw/406d945b24d3958e5fe8cd0cd59d9025b203727b/.prompt.sh')
              .then(res => writeFile(ctx.promptFile, res.body))
              .then(() => execa('chmod', ['+x', ctx.promptFile]))
          }
        ])
      }
    },
    {
      title: 'Configuring bash',
      skip: ctx => ctx.alreadyInstalled && 'Git prompt already installed',
      task: () => {
        const bashrcFile = join(os.homedir(), '.bashrc')
        const appendText = `
if [ -x ~/bin/.prompt.sh ]; then
  . ~/bin/.prompt.sh
fi\n`
        return readFile(bashrcFile)
          .then(data => writeFile(bashrcFile, data + appendText))
      }
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
