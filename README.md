# micox - a declarative web framework
[![npm version](https://badge.fury.io/js/micox.svg)](https://badge.fury.io/js/micox)
[![CircleCI](https://circleci.com/gh/minamorl/micox.svg?style=svg)](https://circleci.com/gh/minamorl/micox)

## Introduction

Micox is a declarative web framework designed for simplicity. It uses virtualdom via snabbdom internally. This framework provides simple state management that uses pub/sub pattern like event-emitter.

## Features

- A simple state management system
- Virtual DOM (via snabbdom)
- Declarative syntax, which does not depends JSX
- Standard flexible router (optional)

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
  "click": (ev: any) => portal.transfer(states.text, "changed")
})
// Apply to container.
const container = document.querySelector("#container")
new Micox(portal, container!).contains(component)
```

A portal is a object that communicates between Micox objects. You can pass any objects with any keys.

## Documentation

TL;DR: There are two main objects, `Micox` and `Portal`. `Micox` is a virtual dom. And `Portal` handles states of micox. `portal.get` and `portal.transfer` are pair functions.


### `html` objects

`html` is an object set of wrapper functions of `Micox`. See below to understand `Micox`.

### Micox

Micox is a wrapper of DOM object. This class provides core functions to define DOM objects and its APIs. The constructor takes two arguments, `portal` and `patchTo`. `portal` is an instance of `Portal` and `patchTo` is a container object like a HTML element. Both are optional arguments. But you may need to set those arguments at defining a root object.

### Portal

Portal has two functions, called `get` and `transfer`. As its name suggests, `get` receives current states from a portal. And `transfer` transfers any objects with key. Any type of key is allowed. So you can choose `string` or `Symbol` or anything you like.

### Router

Router is provided as a separated module. If you want to use, import `micox/dist/router`.

```ts
import {Micox, Portal, html} from "micox"
import { Router } from "micox/dist/router";
const portal = new Portal()

document.addEventListener("DOMContentLoaded", function(event) {
  const container = document.querySelector("#app")
  const router = new Router()
  router.route("/", (props) => {
    return html.div("Index page")
  }, {
    fallback: true
  })
  router.route("/{:string}", (props) => {
    return html.div("data:" + JSON.stringify(props.data))
  })
  new Micox(portal, container!).contains(router)
})
```

## Internal

The code will look like:

```ts
const portal = new Portal()
const div = new Micox(portal, document.getElementById("app-container"))
    .contains(portal => "text: " + portal.get("text") || "default")
    .as("div")
portal.transfer("text", "transfered")

// The output will be like "text: transfered"
```

## Author
minamorl

## License
MIT
