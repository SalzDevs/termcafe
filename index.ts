import { Box, Text, createCliRenderer, type CliRenderer, type KeyEvent } from "@opentui/core"
import { createDefaultConfig, getConfigPath, loadConfig, saveConfig } from "./src/app/config"
import {
  createInitialState,
  enterDashboard,
  isDashboardState,
  isSetupState,
  moveSetupSelection,
  openSetup,
  toggleSetupWidget,
  type AppState,
  type DashboardState,
  type SetupState,
} from "./src/app/state"
import { getAvailableWidgets, getWidgetById } from "./src/app/widgets"

type StatusMessage = {
  type: "info" | "error"
  text: string
}

const colors = {
  background: "#1E1E2E",
  text: "#CDD6F4",
  muted: "#A6ADC8",
  accent: "#89B4FA",
  success: "#A6E3A1",
  error: "#F38BA8",
  selected: "#F9E2AF",
}

function clearRoot(renderer: CliRenderer): void {
  const children = [...renderer.root.getChildren()]

  for (const child of children) {
    renderer.root.remove(child.id)
  }
}

function renderSetupView(state: SetupState, statusMessage: StatusMessage | null, isSaving: boolean) {
  const availableWidgets = getAvailableWidgets()

  const widgetRows = availableWidgets.map((widget, index) => {
    const isFocused = index === state.setupSelectedIndex
    const isSelected = state.selectedWidgetIds.includes(widget.id)

    const cursor = isFocused ? "❯" : " "
    const marker = isSelected ? "●" : "○"

    return Text({
      content: `${cursor} ${marker} ${widget.name} (${widget.id})`,
      fg: isFocused ? colors.selected : colors.text,
    })
  })

  const footerLines = [
    Text({
      content: "Keys: ↑/↓ move  •  Space/Enter toggle  •  S save  •  Q quit",
      fg: colors.muted,
    }),
    Text({
      content: `Config: ${getConfigPath()}`,
      fg: colors.muted,
    }),
  ]

  if (statusMessage) {
    footerLines.push(
      Text({
        content: statusMessage.text,
        fg: statusMessage.type === "error" ? colors.error : colors.success,
      }),
    )
  }

  if (isSaving) {
    footerLines.push(Text({ content: "Saving configuration...", fg: colors.selected }))
  }

  return Box(
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      padding: 1,
      gap: 1,
      backgroundColor: colors.background,
    },
    Box(
      {
        border: true,
        borderStyle: "rounded",
        borderColor: colors.accent,
        padding: 1,
        flexDirection: "column",
      },
      Text({ content: "Termcafe • Setup", fg: colors.accent }),
      Text({ content: "Choose widgets for your dashboard", fg: colors.muted }),
    ),
    Box(
      {
        flexGrow: 1,
        border: true,
        borderStyle: "rounded",
        padding: 1,
        flexDirection: "column",
      },
      ...widgetRows,
    ),
    Box(
      {
        border: true,
        borderStyle: "rounded",
        padding: 1,
        flexDirection: "column",
        gap: 0,
      },
      ...footerLines,
    ),
  )
}

function renderDashboardView(state: DashboardState, statusMessage: StatusMessage | null) {
  const widgetRows =
    state.enabledWidgetIds.length > 0
      ? state.enabledWidgetIds.map((widgetId, index) => {
          const widget = getWidgetById(widgetId)
          const label = widget ? `${widget.name} (${widget.id})` : `${widgetId} (unknown widget)`

          return Text({
            content: `${index + 1}. ${label}`,
            fg: colors.text,
          })
        })
      : [Text({ content: "No widgets enabled yet.", fg: colors.muted })]

  const footerLines = [
    Text({
      content: "Keys: E edit widgets  •  Q quit",
      fg: colors.muted,
    }),
    Text({
      content: `Config: ${getConfigPath()}`,
      fg: colors.muted,
    }),
  ]

  if (statusMessage) {
    footerLines.push(
      Text({
        content: statusMessage.text,
        fg: statusMessage.type === "error" ? colors.error : colors.success,
      }),
    )
  }

  return Box(
    {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      padding: 1,
      gap: 1,
      backgroundColor: colors.background,
    },
    Box(
      {
        border: true,
        borderStyle: "rounded",
        borderColor: colors.accent,
        padding: 1,
      },
      Text({ content: "Termcafe • Dashboard", fg: colors.accent }),
    ),
    Box(
      {
        flexGrow: 1,
        border: true,
        borderStyle: "rounded",
        padding: 1,
        flexDirection: "column",
      },
      ...widgetRows,
    ),
    Box(
      {
        border: true,
        borderStyle: "rounded",
        padding: 1,
        flexDirection: "column",
        gap: 0,
      },
      ...footerLines,
    ),
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function runApp(): Promise<void> {
  const config = await loadConfig()
  const availableWidgetIds = getAvailableWidgets().map((widget) => widget.id)

  let appState: AppState = createInitialState(config)
  let statusMessage: StatusMessage | null = config
    ? { type: "info", text: "Press E to edit your dashboard widgets." }
    : { type: "info", text: "No config found. Select widgets and press S to save." }
  let isSaving = false

  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    screenMode: "alternate-screen",
    targetFps: 30,
  })

  const renderAppView = (): void => {
    if (renderer.isDestroyed) {
      return
    }

    clearRoot(renderer)

    const view = isSetupState(appState)
      ? renderSetupView(appState, statusMessage, isSaving)
      : renderDashboardView(appState, statusMessage)

    renderer.root.add(view)
  }

  const shutdown = (): void => {
    if (!renderer.isDestroyed) {
      renderer.destroy()
    }
  }

  const onKeyPress = async (key: KeyEvent): Promise<void> => {
    const keyName = key.name?.toLowerCase()

    if (!keyName) {
      return
    }

    if (keyName === "q") {
      shutdown()
      return
    }

    if (isSaving) {
      return
    }

    if (isSetupState(appState)) {
      if (keyName === "up" || keyName === "k") {
        appState = moveSetupSelection(appState, "up", availableWidgetIds)
        renderAppView()
        return
      }

      if (keyName === "down" || keyName === "j") {
        appState = moveSetupSelection(appState, "down", availableWidgetIds)
        renderAppView()
        return
      }

      if (keyName === "space" || keyName === "return") {
        const focusedWidgetId = availableWidgetIds[appState.setupSelectedIndex]

        if (focusedWidgetId) {
          appState = toggleSetupWidget(appState, focusedWidgetId)
          statusMessage = { type: "info", text: `Toggled widget: ${focusedWidgetId}` }
          renderAppView()
        }

        return
      }

      if (keyName === "s") {
        const setupState = appState

        isSaving = true
        statusMessage = { type: "info", text: "Saving configuration..." }
        renderAppView()

        try {
          const nextConfig = createDefaultConfig(setupState.selectedWidgetIds)
          await saveConfig(nextConfig)
          appState = enterDashboard(setupState)
          statusMessage = { type: "info", text: "Configuration saved." }
        } catch (error) {
          statusMessage = {
            type: "error",
            text: `Failed to save config: ${getErrorMessage(error)}`,
          }
        } finally {
          isSaving = false
          renderAppView()
        }
      }

      return
    }

    if (isDashboardState(appState) && keyName === "e") {
      appState = openSetup(appState)
      statusMessage = { type: "info", text: "Editing setup. Press S to save changes." }
      renderAppView()
    }
  }

  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    void onKeyPress(key)
  })

  renderAppView()

  await new Promise<void>((resolve) => {
    renderer.on("destroy", () => {
      resolve()
    })
  })
}

try {
  await runApp()
} catch (error) {
  console.error("Termcafe failed:", error)
  process.exitCode = 1
}
