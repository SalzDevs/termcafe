import { Box, createCliRenderer,Text } from "@opentui/core";


function destroyMessage() {
  console.log("Goodbye!")
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  onDestroy: destroyMessage
})


renderer.root.add(
  Box(
    {borderStyle: "rounded", padding: 1, flexDirection: "column", gap: 1},
    Text({content: "Hello, World!"}),
    Text({content: "Press Ctrl+C to exit"}),
  )
)
