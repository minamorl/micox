# micox - a declarative web framework
[![npm version](https://badge.fury.io/js/micox.svg)](https://badge.fury.io/js/micox)

## Usage

```ts
// Create portal object for communicating.
const portal = new Portal()
// Define keys for portal. (this is optional)
const states = {
    text: Symbol()
}
// Define a component and register event handler.
const component = (portal: Portal) => html.div(portal.get(states.text) || "default").events({
  "click": (ev: any) => portal.transfer(new Map([[states.text, "changed"]]))
})
// Apply to container.
const container = document.querySelector("#container")
new Micox(portal, container!).contains(component)
```

## Internal

TL;DR: There are two main objects, `Micox` and `Portal`. `Micox` is a virtual dom. And `Portal` handles states of micox. `portal.get` and `portal.transfer` are pair functions.
The code will look like:

```ts
const portal = new Portal()
const div = new Micox(portal, document.getElementById("app-container"))
    .contains(portal => "text: " + portal.get("text") || "default")
    .as("div")
portal.transfer(new Map([["text", "transfered"]]))

// The output will be like "text: transfered"
```

This project is alpha stage.

## Author
minamorl

## License
MIT
