import test from "tape"
import {Mico, Portal} from "../src/index"
import {h} from "snabbdom/h"
import {VNode} from "snabbdom/vnode"

test("Mico", t => {
  const portal = new Portal()
  const div = new Mico(portal)
    .content(portal => "text: " + portal.get("text", "default"))
    .as("div")
  portal.transfer(new Map([["text", "transfered"]]))
  t.equals(div.element.text, h("div", "text: transfered").text)
  t.end()
})
