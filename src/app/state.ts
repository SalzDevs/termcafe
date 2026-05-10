import type { TermcafeConfig } from "./config"

type SetupState = {

  mode: "setup"
  selectedWidgetIds: string[]
  setupSelectedIndex: number
}

type DashboardState = {
  mode: "dashboard"
  enabledWidgetIds: string[]
}

export type AppState = SetupState | DashboardState

export function createInitialState(config: TermcafeConfig | null): AppState {
  if (config === null) {
    return {
      mode: "setup",
      selectedWidgetIds: [],
      setupSelectedIndex: 0,
    }
  }
  return {
    mode: "dashboard",
    enabledWidgetIds: config.widgets,
  }
}
