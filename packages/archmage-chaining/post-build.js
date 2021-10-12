// TypeScript does the bulk of the building but this script performs additional copying and transforming of files

const path = require('path')
const fs = require('fs')

function copyFile(distPath, filename) {
  fs.writeFileSync(path.join(distPath, filename), fs.readFileSync(path.join(__dirname, filename), 'utf8'))
}

function main() {
  const packageJson = require(path.join(__dirname, 'package.json'))
  const distPath = path.resolve(__dirname, "../../dist/archmage-chaining")
  packageJson.main = "lib/index"
  const packageOutput = JSON.stringify(packageJson, undefined, 2)
  fs.writeFileSync(path.join(distPath, 'package.json'), packageOutput)
  copyFile(distPath, 'README.md')
}

main()
