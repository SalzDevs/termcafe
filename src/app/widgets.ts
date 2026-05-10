export type WidgetDefinition = {
  id: string
  name: string
  description: string
  defaultWidth: number
  defaultHeight: number
}

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: "clock",
    name: "Clock",
    description: "Shows the current local time.",
    defaultWidth: 4,
    defaultHeight: 2,
  },
  {
    id: "weather",
    name: "Weather",
    description: "Shows current weather for a selected city.",
    defaultWidth: 4,
    defaultHeight: 2,
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Shows upcoming dates and events.",
    defaultWidth: 4,
    defaultHeight: 3,
  },
  {
    id: "todo",
    name: "To-do List",
    description: "Shows a small list of tasks.",
    defaultWidth: 4,
    defaultHeight: 4,
  },
  {
    id: "github",
    name: "GitHub Activity",
    description: "Shows recent GitHub activity and contribution-style stats.",
    defaultWidth: 6,
    defaultHeight: 4,
  },
  {
    id: "music",
    name: "Now Playing",
    description: "Shows the currently playing track.",
    defaultWidth: 4,
    defaultHeight: 2,
  },
]

export function getAvailableWidgets(): WidgetDefinition[] {
  return AVAILABLE_WIDGETS
}

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return AVAILABLE_WIDGETS.find((widget) => widget.id === id)
}

export function isKnownWidgetId(id: string): boolean {
  return getWidgetById(id) !== undefined
}
