import { join } from "node:path"
import { z } from "zod"

const APP_CONFIG_DIR_NAME = "termcafe"
const CONFIG_FILE_NAME = "config.json"

const TermcafeConfigSchema = z.object({
  version: z.number(),
  widgets: z.array(z.string().min(1)),
})

export type TermcafeConfig = z.infer<typeof TermcafeConfigSchema>

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

export async function loadConfig(configPath = getConfigPath()): Promise<TermcafeConfig | null> {
  const configFile = Bun.file(configPath)

  if (!(await configFile.exists())) {
    return null
  }

  let rawConfig: unknown

  try {
    rawConfig = await configFile.json()
  } catch (error) {
    throw new Error(`Could not parse config file at ${configPath}`, { cause: error })
  }

  const result = TermcafeConfigSchema.safeParse(rawConfig)

  if (!result.success) {
    throw new Error(`Invalid config file at ${configPath}`, { cause: result.error })
  }

  return result.data
}
