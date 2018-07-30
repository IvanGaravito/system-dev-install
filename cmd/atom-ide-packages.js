const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Atom IDE packages from file',
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
    Source: https://evanhahn.com/atom-apm-install-list/
    Commands:
      # Generate packages file to install later
      apm list --installed --bare | grep '^[^@]\+' -o > my_atom_packages.txt
      # Install Atom's packages from file
      apm install --packages-file my_atom_packages.txt
  */

  const fs = require('fs')
  const {promisify} = require('util')
  const execa = require('execa')
  const Listr = require('listr')

  const stat = promisify(fs.stat)

  const tasks = new Listr([
    {
      title: 'Getting Atom IDE information',
      task: (ctx, task) => {
        // Looks for installed version
        return execa('which', ['atom'])
          .then(result => execa('atom', ['-v']))
          .then(result => result.stdout.match(/Atom\s*:\s*([0-9.]+)/)[1])
          .then(result => {
            task.title = `${task.title}: ${result}`
          })
          .catch(() => {
            throw new Error('Atom IDE not installed')
          })
      }
    },
    {
      title: 'Installing Atom IDE packages',
      task: (ctx, task) => {
        const filename = args._[1]
        return new Promise((resolve, reject) => {
          stat(filename)
            .then(stats => {
              if (!stats.isFile()) {
                reject(new Error('Need a packages file'))
              }
              return execa('apm', ['install', '--packages-file', filename])
            })
            .then(() => resolve())
            .catch((err) => reject(err))
        })
      }
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
