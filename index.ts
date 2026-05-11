import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"
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

const rl = createInterface({ input, output })

async function ask(question: string): Promise<string> {
  return (await rl.question(question)).trim()
}

function clearScreen(): void {
  output.write("\x1Bc")
}

function renderSetup(state: SetupState): void {
  const availableWidgets = getAvailableWidgets()

  clearScreen()
  console.log("Termcafe • Setup")
  console.log("Select widgets for your dashboard.\n")

  availableWidgets.forEach((widget, index) => {
    const isFocused = index === state.setupSelectedIndex
    const isSelected = state.selectedWidgetIds.includes(widget.id)

    const cursor = isFocused ? ">" : " "
    const marker = isSelected ? "x" : " "

    console.log(`${cursor} [${marker}] ${index + 1}. ${widget.name} (${widget.id})`)
  })

  console.log("\nCommands:")
  console.log("  n / j  -> move down")
  console.log("  p / k  -> move up")
  console.log("  t      -> toggle focused widget")
  console.log("  1..N   -> toggle widget by number")
  console.log("  s      -> save + continue to dashboard")
  console.log("  q      -> quit")
  console.log(`\nConfig path: ${getConfigPath()}\n`)
}

function renderDashboard(state: DashboardState): void {
  clearScreen()
  console.log("Termcafe • Dashboard\n")

  if (state.enabledWidgetIds.length === 0) {
    console.log("No widgets enabled yet.")
  } else {
    console.log("Enabled widgets:")

    state.enabledWidgetIds.forEach((widgetId, index) => {
      const widget = getWidgetById(widgetId)
      const label = widget ? `${widget.name} (${widget.id})` : `${widgetId} (unknown)`
      console.log(`  ${index + 1}. ${label}`)
    })
  }

  console.log("\nCommands:")
  console.log("  e      -> edit widgets (open setup)")
  console.log("  q      -> quit")
  console.log(`\nConfig path: ${getConfigPath()}\n`)
}

async function runSetup(state: SetupState): Promise<AppState | null> {
  const availableWidgetIds = getAvailableWidgets().map((widget) => widget.id)

  while (true) {
    renderSetup(state)

    const command = (await ask("setup> ")).toLowerCase()

    if (command === "" && input.readableEnded) {
      return null
    }

    if (command === "q") {
      return null
    }

    if (command === "n" || command === "j" || command === "down") {
      state = moveSetupSelection(state, "down", availableWidgetIds)
      continue
    }

    if (command === "p" || command === "k" || command === "up") {
      state = moveSetupSelection(state, "up", availableWidgetIds)
      continue
    }

    if (command === "t" || command === "toggle") {
      const focusedWidgetId = availableWidgetIds[state.setupSelectedIndex]

      if (focusedWidgetId) {
        state = toggleSetupWidget(state, focusedWidgetId)
      }

      continue
    }

    if (command === "s" || command === "save") {
      const config = createDefaultConfig(state.selectedWidgetIds)
      await saveConfig(config)
      return enterDashboard(state)
    }

    const oneBasedIndex = Number(command)

    if (Number.isInteger(oneBasedIndex)) {
      const zeroBasedIndex = oneBasedIndex - 1
      const selectedWidgetId = availableWidgetIds[zeroBasedIndex]

      if (selectedWidgetId) {
        state = {
          ...state,
          setupSelectedIndex: zeroBasedIndex,
        }
        state = toggleSetupWidget(state, selectedWidgetId)
      }

      continue
    }
  }
}

async function runDashboard(state: DashboardState): Promise<AppState | null> {
  while (true) {
    renderDashboard(state)

    const command = (await ask("dashboard> ")).toLowerCase()

    if (command === "" && input.readableEnded) {
      return null
    }

    if (command === "q" || command === "quit") {
      return null
    }

    if (command === "e" || command === "edit") {
      return openSetup(state)
    }
  }
}

async function runApp(): Promise<void> {
  const config = await loadConfig()
  let state: AppState = createInitialState(config)

  while (true) {
    if (isSetupState(state)) {
      const nextState = await runSetup(state)

      if (nextState === null) {
        break
      }

      state = nextState
      continue
    }

    if (isDashboardState(state)) {
      const nextState = await runDashboard(state)

      if (nextState === null) {
        break
      }

      state = nextState
    }
  }
}

try {
  await runApp()
} catch (error) {
  console.error("Termcafe failed:", error)
  process.exitCode = 1
} finally {
  rl.close()
}
