import { createCliRenderer,Text } from "@opentui/core";


const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})


renderer.root.add(
  Text({
      content: "Hello World",
      fg: "#00FF00",
  })
)
