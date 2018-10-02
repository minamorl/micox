import test from "tape"
import {Micox, Portal} from "../src/index"
import {h} from "snabbdom/h"
import {VNode} from "snabbdom/vnode"

test("Micox should accept changes from transfered object", t => {
  const portal = new Portal()
  const div = new Micox(portal)
    .contains(portal => "text: " + portal.get("text", "default"))
    .as("div")
  portal.transfer(new Map([["text", "transfered"]]))
  t.equals(div.element.text, h("div", "text: transfered").text)
  t.end()
})
test("Micox can handle complex children", t => {
  const portal = new Portal()
  const div = new Micox(portal)
    .contains(portal => [
      new Micox(portal).contains(portal => portal.get("text", "text1")),
      new Micox(portal).contains(portal => [new Micox(portal).contains(portal => portal.get("text", "text1"))])
    ])
  portal.transfer(new Map([["text", "text2"]]))
  t.deepEqual(div.element, h("div", {}, [h("div", "text2"), h("div", {}, [h("div", "text2")])]))
  t.end()
})
test("Micox can be constructed without portal object", t => {
  const div = new Micox().contains("static content")
  t.deepEqual(div.element, h("div", "static content"))
  t.end()
})
test("Micox can handle props", t => {
  const div = new Micox().props({"id": "id"})
  t.deepEqual(div.element, h("div", {props: {"id": "id"}}))
  t.end()
})