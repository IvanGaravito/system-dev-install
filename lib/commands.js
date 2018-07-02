const {readdir} = require('fs')
const {join, normalize} = require('path')

const cmdDir = normalize(join(__dirname, '../cmd/'))

module.exports = (cb) => {
  readdir(cmdDir, (err, files) => {
    if (err) return cb(err)
    files = files
      .filter(file => file.match(/\.js$/) !== null)
      .map(file => {
        try {
          const {name, description, requireSudo} = require(join(cmdDir, file))
          return {name, description, requireSudo}
        } catch (e) {
          return null
        }
      })
      .filter(file => file !== null)
    cb(null, files)
  })
}
