const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Wireshark',
  requireSudo: true
})

module.exports.main = function (args, cb) {
  // Needs be run as root
  if (!this.isRoot()) {
    let err = new Error('Need root permissions')
    err.exitStatus = 3
    return cb(err)
  }

  /*
    Source: https://launchpad.net/~wireshark-dev/+archive/ubuntu/stable
    Commands:
      sudo add-apt-repository ppa:wireshark-dev/stable
      sudo apt-get update
      sudo apt-get install wireshark
  */

  const execa = require('execa')
  const Listr = require('listr')

  const tasks = new Listr([
    {
      title: 'Adding apt repository',
      task: () => execa('add-apt-repository', ['-y', 'ppa:wireshark-dev/stable'])
    },
    {
      title: 'Updating package cache',
      task: () => execa('apt-get', ['update'])
    },
    {
      title: 'Installing package',
      task: () => execa('apt-get', ['-y', 'install', 'wireshark'])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
