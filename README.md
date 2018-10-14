# micox - a declarative web framework

## Usage

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