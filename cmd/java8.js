const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Oracle Java 8',
  requireSudo: true
})

module.exports.main = function (args, cb) {
  // Needs be run as root
  if (!this.isRoot() && exports.requireSudo) {
    let err = new Error('Need root permissions')
    err.exitStatus = 3
    return cb(err)
  }

  /*
    Source: http://www.webupd8.org/2012/09/install-oracle-java-8-in-ubuntu-via-ppa.html
    Commands:
      sudo add-apt-repository ppa:webupd8team/java
      sudo apt-get update
      sudo apt-get install oracle-java8-installer
  */

  const execa = require('execa')
  const Listr = require('listr')

  const tasks = new Listr([
    {
      title: 'Adding apt repository',
      task: () => execa('add-apt-repository', ['-y', 'ppa:webupd8team/java'])
    },
    {
      title: 'Updating package cache',
      task: () => execa('apt-get', ['update'])
    },
    {
      title: 'Installing java8 package',
      task: () => execa('apt-get', ['-y', 'install', 'oracle-java8-installer'])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
