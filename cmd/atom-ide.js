const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Atom IDE',
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
    Source: https://atom.io
    Commands:
  */

  const fs = require('fs')
  const execa = require('execa')
  const Listr = require('listr')
  const semver = require('semver')
  const shell = require('shelljs')
  const got = require('got')

  const tasks = new Listr([
    {
      title: 'Getting Atom IDE information',
      task: (ctx, t) => {
        return new Listr([
          {
            title: 'Getting local',
            task: (c, task) => {
              // Looks for installed version
              return execa('which', ['atom'])
                .then(result => execa('atom', ['-v']))
                .then(result => result.stdout.match(/Atom\s*:\s*([0-9.]+)/)[1])
                .then(result => {
                  ctx.localVersion = result
                  task.title = `${task.title}: ${result}`
                })
                .catch(() => {
                  ctx.localVersion = null
                  task.skip('Atom IDE not installed')
                })
            }
          },
          {
            title: 'Getting latest',
            task: (c, task) => {
              // Asks for latest Atom's version
              return got('https://atom.io')
                .then(res => res.body.match(/class="version"[>]([0-9.]+)[<]/)[1])
                .then(version => {
                  ctx.remoteVersion = version
                  task.title = `${task.title}: ${ctx.remoteVersion}`
                })
            }
          }
        ], { concurrent: true })
      }
    },
    {
      title: 'Installing Atom IDE',
      skip: ctx => {
        if (ctx.localVersion && !semver.gt(ctx.remoteVersion, ctx.localVersion)) {
          return `Installed Atom IDE is updated to ${ctx.localVersion}`
        }
      },
      task: (ctx, task) => {
        task.title = `${task.title} ${ctx.remoteVersion}`
        return new Listr([
          {
            title: 'Downloading Atom IDE',
            task: (c, t) => new Promise((resolve, reject) => {
              let filename = ctx.filename = join(shell.tempdir(), 'atom-ide_' + ctx.remoteVersion + '.deb')
              let writeable = fs.createWriteStream(filename)
              let title = t.title

              got.stream('https://atom.io/download/deb')
                .on('downloadProgress', progress => {
                  let pc = (progress.percent * 100).toFixed(1)
                  t.title = `${title}: ${pc}%`
                  if (progress.percent === 1.0) resolve()
                })
                .on('error', err => { reject(err) })
                .pipe(writeable)
            })
          },
          {
            title: 'Installing Atom IDE',
            task: () => execa('dpkg', ['-i', ctx.filename])
          }
        ])
      }
    },
    {
      title: 'Cleaning temp data',
      skip: ctx => {
        if (ctx.localVersion && !semver.gt(ctx.remoteVersion, ctx.localVersion)) {
          return `Installed Atom IDE is updated to ${ctx.localVersion}`
        }
      },
      task: ctx => execa('rm', ['-f', ctx.filename])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
