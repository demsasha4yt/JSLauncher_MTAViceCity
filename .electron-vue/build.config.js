const path = require('path')

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */
module.exports = {
  arch: 'x64',
  asar: true,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../build/icons/icon'),
  ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,
  out: path.join(__dirname, '../build'),
  overwrite: true,
  platform: process.env.BUILD_TARGET || 'all',
  win32metadata:{
    CompanyName: "MTA Vice City Team",
    FileDescription: "Launcher for MTA Vice City Project",
    ProductName: "MTA Vice City",
    InternalName: "MTA Vice City",
    'requested-execution-level': 'requireAdministrator'
  }
}
