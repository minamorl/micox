import test from "tape"
import {Micox, Portal, html} from "../src/index"
import {h} from "snabbdom/h"

test("Micox should accept changes from transfered object", t => {
  const portal = new Portal()
  const div = new Micox(portal)
    .contains(portal => "text: " + portal.get("text") || "default")
    .as("div")
  portal.transfer("text", "transfered")
  t.equals(div.element!.text!, h("div", "text: transfered").text)
  t.end()
})
test("Micox can handle complex children", t => {
  const portal = new Portal()
  const div = new Micox(portal)
    .contains(portal => [
      new Micox(portal).contains(portal => portal.get("text") || "text1"),
      new Micox(portal).contains(portal => [new Micox(portal).contains(portal => portal.get("text") || "text1")])
    ])
  portal.transfer("text", "text2")
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
test("Micox can handle attrs", t => {
  const div = new Micox().attrs({"href": "test"})
  t.deepEqual(div.element, h("div", {attrs: {"href": "test"}}))
  t.end()
})
test("Micox can handle props with portal", t => {
  const portal = new Portal()
  const div = new Micox(portal).props(portal => {return {"id": portal.get("id") || "default"}})
  portal.transfer("id", "transfered")
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
  const cleanup = require('jsdom-global')("<div id='outer'><div id='container' /></div>")
  const container = document.getElementById("container")!
  const portal = new Portal()
  const div = new Micox(portal, container).contains("default")
  div.id("container")
  t.equal(document.getElementById("container")!.textContent, "default")
  div.contains("another content")
  t.equal(document.getElementById("container")!.textContent, "another content")
  cleanup()
  t.end()
})
test("micoxWrapper defines a shorthand of micox", t => {
  const component = (portal: Portal) => html.div([
    html.div(portal.get("text") || "default")
  ])
  const portal = new Portal()
  const div = new Micox(portal).contains(component)
  t.deepEqual(div.element, h("div", {}, h("div", {}, h("div", "default"))))
  portal.transfer("text", "transfered")
  t.deepEqual(div.element, h("div", {}, h("div", {}, h("div", "transfered"))))
  t.end()
})
test("Micox handles events", t => {
  const cleanup = require('jsdom-global')("<div id='outer'><div id='container' /></div>")
  const component = (portal: Portal) => html.div(portal.get("text") || "default").events({
    "click": (ev: any) => portal.transfer("text", "changed")
  }).id("dive")
  const portal = new Portal()
  const container = document.querySelector("#container")! as HTMLElement
  const div = new Micox(portal, container)
    .contains(component);
  (document.querySelector("#dive")! as HTMLElement).click()
  t.equal(document.querySelector("#dive")!.textContent, "changed")
  cleanup()
  t.end()
})
test("Element can be destroyed", t => {
  const input = html.input("")
  const div = html.div(input)
  const m = new Micox().contains([div])
  input.destroy()
  t.deepEqual(m.element, h("div", {}, h("div", {})))
  t.end()
})
test("Micox can contains undefined", t => {
  const div = html.div()
  t.deepEqual(div.element, h("div", {}))
  t.end()
})