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


export function isSetupState(state: AppState): state is SetupState {
  return state.mode === "setup" 
}

export function isDashboardState(state: AppState): state is DashboardState {
  return state.mode === "dashboard"
}

export function enterDashboard(state: SetupState): DashboardState {
  return {
    mode: "dashboard",
    enabledWidgetIds: [...state.selectedWidgetIds],
  }
}

export function moveSetupSelection(state: SetupState, direction: "up" | "down", availableWidgetIds: string[]): SetupState {
  const widgetCount = availableWidgetIds.length

  if (widgetCount === 0) {
    return {
      ...state,
      setupSelectedIndex: 0,
    }
  }

  const delta = direction === "up" ? -1 : 1
  const nextIndex = (state.setupSelectedIndex + delta + widgetCount) % widgetCount

  return {
    ...state,
    setupSelectedIndex: nextIndex,
  }
}

export function toggleSetupWidget(state: SetupState, widgetId: string): SetupState {
  const isSelected = state.selectedWidgetIds.includes(widgetId)

  return {
    ...state,
    selectedWidgetIds: isSelected
      ? state.selectedWidgetIds.filter(id => id !== widgetId)
      : [...state.selectedWidgetIds, widgetId],
  }
}
