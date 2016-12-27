'use strict'
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const home = require('user-home')
const utils = require('./utils')

const configDir = path.join(home, '.sao')
const packagesDir = path.join(configDir, 'packages')
const reposDir = path.join(configDir, 'repos')

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) {
    mkdirp.sync(packagesDir)
    mkdirp.sync(reposDir)
  }
}

function getConfig(dir, configFileName, template) {
  return new Promise((resolve, reject) => {
    const configPath = path.join(dir, configFileName)
    fs.exists(configPath, exists => {
      if (!exists) return resolve(null)
      try {
        resolve(require(configPath))
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND' && utils.isRepo(template)) {
          console.log(`
${chalk.yellow(`Since this template is a git repo, we installing missing dependencies for it.`)}
`)
          require('yarn-install')({cwd: dir})
          resolve()
        } else {
          reject(err)
        }
      }
    })
  })
}

exports.configDir = configDir
exports.packagesDir = packagesDir
exports.reposDir = reposDir
exports.ensureConfigDir = ensureConfigDir
exports.getConfig = getConfig