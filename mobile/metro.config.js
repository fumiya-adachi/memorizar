const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, "..")

const config = getDefaultConfig(projectRoot)

// monorepo: packages/* を watchFolders に追加
config.watchFolders = [workspaceRoot]

// monorepo: node_modules の解決順を明示
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

module.exports = config
