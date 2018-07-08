const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Node.js LTS',
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
    Source: https://github.com/IvanGaravito/node-install
    Commands:
      curl https://nodejs.org/en/ | grep home-downloadbutton | grep LTS | grep -E '(https[^"]+)'
      cd $INSTALL_PATH && tar --no-same-owner --strip-components 1 -xf $PACKAGE_FILE
  */

  const fs = require('fs')
  const execa = require('execa')
  const Listr = require('listr')
  const semver = require('semver')
  const shell = require('shelljs')
  const got = require('got')

  const tasks = new Listr([
    {
      title: 'Getting Node.js LTS information',
      task: ctx => {
        return new Listr([
          {
            title: 'Getting local',
            task: (c, task) => {
              // Looks for version of installed node
              return execa('which', ['node'])
                .then(result => execa('node', ['-v']))
                .then(result => {
                  ctx.localVersion = result.stdout
                  task.title = `${task.title}: ${result.stdout}`
                })
                .catch(() => {
                  ctx.localVersion = null
                  task.skip('Node.js not installed')
                })
            }
          },
          {
            title: 'Getting latest',
            task: (c, task) => {
              // Asks for latest node's version
              // $ curl https://nodejs.org/en/ | grep home-downloadbutton | grep LTS | grep -E '(https[^"]+)'
              return execa('curl', ['-s', 'https://nodejs.org/en/'])
                .then(result => execa('grep', ['home-downloadbutton'], { input: result.stdout }))
                .then(result => result.stdout.match(/(https[^"]+)/)[1])
                .then(result => {
                  ctx.remoteVersion = result.match(/(v[0-9.]+)/)[1]
                  ctx.remoteFile = `node-${ctx.remoteVersion}-linux-x64.tar.xz`
                  ctx.remoteUrl = `${result}${ctx.remoteFile}`
                  task.title = `${task.title}: ${ctx.remoteVersion} - ${ctx.remoteUrl}`
                })
            }
          }
        ], { concurrent: true })
      }
    },
    {
      title: 'Installing Node.js',
      skip: ctx => {
        if (ctx.localVersion && !semver.gt(ctx.remoteVersion, ctx.localVersion)) {
          return `Installed Node.js is updated to ${ctx.localVersion}`
        }
      },
      task: (ctx, task) => {
        task.title = `${task.title} ${ctx.remoteVersion}`
        return new Listr([
          {
            title: 'Downloading Node.js',
            task: (c, t) => new Promise((resolve, reject) => {
              let tmpDir = ctx.tmpDir = join(shell.tempdir(), 'nodejs-lts_' + ctx.remoteVersion)
              let dataDir = ctx.dataDir = join(tmpDir, 'data')
              let fullname = ctx.fullname = join(tmpDir, ctx.remoteFile)
              if (shell.test('-d', tmpDir)) {
                shell.rm('-rf', tmpDir)
              }
              shell.mkdir(tmpDir)
              shell.mkdir(dataDir)
              let writeable = fs.createWriteStream(fullname)
              let title = t.title

              got.stream(ctx.remoteUrl)
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
            title: 'Unpacking Node.js',
            task: (c, t) => {
              // cd $INSTALL_PATH && tar --no-same-owner --strip-components 1 -xf $PACKAGE_FILE
              const cwd = process.cwd()
              let taskResult
              if (!ctx.localVersion) {
                // Node.js not installed, so installs it freely
                process.chdir('/usr')
                taskResult = execa('tar', ['--no-same-owner', '--strip-components', '1', '-xf', ctx.fullname])
              } else {
                // Node.js installed, need to omit npm files to not break it
                process.chdir(ctx.dataDir)
                taskResult = execa('tar', ['--no-same-owner', '--strip-components', '1', '-xf', ctx.fullname])
                  .then(() => execa('cp', ['-f', 'bin/node', '/usr/bin/node']))
                  .then(() => execa('cp', ['-rf', 'include/node', '/usr/include/node']))
                  .then(() => execa('cp', ['-rf', 'share/*', '/usr/share/']))
              }
              taskResult.then(result => {
                process.chdir(cwd)
              })
              return taskResult
            }
          }
        ])
      }
    },
    {
      title: 'Cleaning temp data',
      skip: ctx => {
        if (ctx.localVersion && !semver.gt(ctx.remoteVersion, ctx.localVersion)) {
          return `Installed Node.js is updated to ${ctx.localVersion}`
        }
      },
      task: ctx => execa('rm', ['-rf', ctx.tmpDir])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
