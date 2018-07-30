const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Yarn',
  requireSudo: true
})

module.exports.main = function (args, cb) {
  // Needs be run as root
  if (module.exports.requireSudo && !this.isRoot()) {
    let err = new Error('Need root permissions')
    err.exitStatus = 3
    return cb(err)
  }

  /*
    Source: https://yarnpkg.com/en/docs/install
    Commands:
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  */

  const execa = require('execa')
  const Listr = require('listr')

  const tasks = new Listr([
    {
      title: 'Getting and installing repository key',
      task: () => {
        return execa('curl', ['-fsSL', 'https://dl.yarnpkg.com/debian/pubkey.gpg'])
          .then(result => execa('apt-key', ['add', '-'], { input: result.stdout }))
      }
    },
    {
      title: 'Adding repository to sources',
      task: () => {
        const repository = 'deb https://dl.yarnpkg.com/debian/ stable main'
        return execa('add-apt-repository', [repository])
      }
    },
    {
      title: 'Updating package cache',
      task: () => execa('apt-get', ['update'])
    },
    {
      title: 'Installing package',
      task: () => execa('apt-get', ['-y', 'install', '--no-install-recommends', 'yarn'])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
