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
  const div1 = new Micox().contains("static content")
  t.deepEqual(div1.element, h("div", "static content"))
  const portal = new Portal()
  const div2 = new Micox(portal).contains("static content")
  t.deepEqual(div2.element, h("div", "static content"))
  t.end()
})
test("Micox can handle props", t => {
  const div = new Micox().props({"id": "id"})
  t.deepEqual(div.element, h("div", {props: {"id": "id"}}))
  t.end()
})
test("Micox can handle props with portal", t => {
  const portal = new Portal()
  const div = new Micox(portal).props(portal => {return {"id": portal.get("id", "default")}})
  portal.transfer(new Map([["id", "transfered"]]))
  t.deepEqual(div.element, h("div", {props: {"id": "transfered"}}))
  t.end()
})
test("Micox has a shorthand for id", t => {
  const div = new Micox().id("id")
  t.deepEqual(div.element, h("div", {props: {"id": "id"}}))
  t.end()
})
test("Micox has a shorthand for class", t => {
  const div = new Micox().class("class")
  t.deepEqual(div.element, h("div", {props: {"class": "class"}}))
  t.end()
})
test("Micox can patch to jsdom", t => {
  const cleanup = require('jsdom-global')("<div><div id='container' /></div>")
  const container = document.getElementById("container")!
  const portal = new Portal()
  const div = new Micox(portal, container).id("default").contains("default")
  t.equal(document.getElementById("id"), null)
  t.assert(document.getElementById("default"))
  cleanup()
  t.end()
})
