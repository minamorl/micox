import {Micox, Portal, html} from "micox"

const portal = new Portal()
const component = (portal: Portal) => html.div([
  html.div(portal.get("text") || "default"),
  html.input("").events({
    "keyup": (ev: any) => portal.transfer(new Map([["text", ev.target.value]]))
  })
])
document.addEventListener("DOMContentLoaded", function(event) {
  const container = document.querySelector("#app")
  if(container) new Micox(portal, container).contains(component)
})

