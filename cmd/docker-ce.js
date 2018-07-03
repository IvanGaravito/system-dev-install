const {basename, join} = require('path')
const Command = require(join(__dirname, '../inc/Command'))

module.exports = new Command({
  name: basename(__filename, '.js'),
  description: 'Installs Docker CE',
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
    Source: https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository
    Commands:
      sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
      sudo add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) \
        stable"
      sudo apt-get update
      sudo apt-get install docker-ce
      sudo usermod -aG docker $USER
  */

  const execa = require('execa')
  const Listr = require('listr')

  const tasks = new Listr([
    {
      title: 'Installing required packages',
      task: () => execa('apt-get', ['-y', 'install', 'apt-transport-https', 'ca-certificates', 'curl', 'software-properties-common'])
    },
    {
      title: 'Getting and installing repository key',
      task: () => {
        return execa('curl', ['-fsSL', 'https://download.docker.com/linux/ubuntu/gpg'])
          .then(result => execa('apt-key', ['add', '-'], { input: result.stdout }))
      }
    },
    {
      title: 'Getting os release code name',
      task: (ctx, task) => {
        return execa('lsb_release', ['-is'])
          .then(result => {
            let title = task.title
            if (result.stdout === 'LinuxMint') {
              task.title = `${title}: using Linux Mint`
              // $ cat /etc/os-release | grep UBUNTU_CODENAME | cut -f2 -d=
              // xenial
              return execa('cat', ['/etc/os-release'])
                .then(result => execa('grep', ['UBUNTU_CODENAME'], { input: result.stdout }))
                .then(result => execa('cut', ['-f2', '-d='], { input: result.stdout }))
                .then(result => { ctx.lsb_release = result.stdout; task.title = `${title}: using Linux Mint based on Ubuntu ${result.stdout}` })
            } else {
              task.title = `${title}: using Linux ${result.stdout}`
              return execa('lsb_release', ['-cs']).then(result => { ctx.lsb_release = result.stdout })
            }
          })
          .then(result => {
            if (!ctx.lsb_release) {
              return Promise.reject(new Error('Cant'))
            }
            return Promise.resolve(ctx.lsb_release)
          })
      }
    },
    {
      title: 'System repository into sources.list',
      task: (ctx, task) => {
        let title = task.title
        task.title = `${title}: removing previous`
        const repository = `deb [arch=amd64] https://download.docker.com/linux/ubuntu ${ctx.lsb_release} stable`
        return execa('add-apt-repository', ['-r', repository])
          .then(result => {
            task.title = `${title}: adding new`
            return execa('add-apt-repository', [repository])
          })
      }
    },
    {
      title: 'Updating package cache',
      task: () => execa('apt-get', ['update'])
    },
    {
      title: 'Installing package',
      task: () => execa('apt-get', ['-y', 'install', 'docker-ce'])
    },
    {
      title: 'Adding group docker to user ' + process.env.SUDO_USER,
      task: () => execa('usermod', ['-a', '-G', 'docker', process.env.SUDO_USER])
    }
  ]).run()

  tasks.then(() => cb())
  tasks.catch(err => cb(err))
}
