import {Micox, Portal, html} from "micox"

const portal = new Portal()
portal.transfer(new Map([["lists", ["Task1", "Task2"]]]))

const component = (portal: Portal) => {
  const lists = Array.from(Array((portal.get("lists").length || 0)).keys())
    .map(v => html.li("" + portal.get("lists")[v]))
  const ul = html.ul(lists)
  const listData = portal.get("lists")
  lists.forEach((v, i) => v.events({
    click: (ev) => portal.transfer(new Map([["lists", listData.splice(i, 1) && listData]]))
  }))
  return html.div([
    html.h1("ToDo App"),
    html.input("").events({
      "keyup": (ev: any) => {
        if (ev.key === 'Enter')
          portal.transfer(new Map([["lists", [...portal.get("lists"), ...[ev.target.value]]]]))
      }
    }),
    ul
  ])
}
document.addEventListener("DOMContentLoaded", function(event) {
  const container = document.querySelector("#app")
  if(container) new Micox(portal, container).contains(component)
})

