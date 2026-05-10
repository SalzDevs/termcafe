import { join } from "node:path"

const APP_CONFIG_DIR_NAME = "termcafe"
const CONFIG_FILE_NAME = "config.json"

export function getConfigDir(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME

  if (xdgConfigHome) {
    return join(xdgConfigHome, APP_CONFIG_DIR_NAME)
  }

  const home = process.env.HOME

  if (home) {
    return join(home, ".config", APP_CONFIG_DIR_NAME)
  }

  return join(process.cwd(), ".termcafe")
}

export function getConfigPath(): string {
  return join(getConfigDir(), CONFIG_FILE_NAME)
}
