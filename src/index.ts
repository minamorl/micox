const snabbdom = require('snabbdom');
const patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners').default, // attaches event listeners
    require('snabbdom/modules/attributes').default,
])

import {h} from "snabbdom/h"
import {VNode} from "snabbdom/vnode"
import {toVNode} from "snabbdom/tovnode"

export type Action = (states: {}) => void
export class Portal {
    private actions: Map<Symbol, Action>
    private states: Map<any, any> = new Map()
    constructor(states?: Map<any, any>) {
        this.actions = new Map()
        this.states = states ? states : this.states
    }
    transfer(key: any, value: any) {
        this.states = new Map([...this.states, ...new Map([[key, value]])])
        for (let action of this.actions)
            action[1](this.states)
    }
    get(name: any) {
        return this.states.get(name)
    }
    registerAction(identity: Symbol, action: Action) {
        return this.actions.set(identity, action)
    }
 }
export type ContainableObject = string | Micox | null

export type PortalCallback<T> = (portal: Portal) => T
export type ContentFunction = PortalCallback<ContainableObject | Array<ContainableObject>>
export type PropsFunction = PortalCallback<{[key: string]: string}>
export type EventsFunction = PortalCallback<{[key: string]: (event: any) => any}>
export type AttrsFunction = PortalCallback<{[key: string]: string | boolean | null}>

export type MicoxContent = ContentFunction | ContainableObject | Array<ContentFunction | ContainableObject>

export class Micox {
    private portal?: Portal
    public element: VNode | undefined
    private elementType: string = "div"
    private elementData: {[key: string]: any} = {}
    private propsFunc?: PropsFunction
    private eventsFunc?: EventsFunction
    private attrsFunc?: AttrsFunction
    private content: MicoxContent| string | null = null
    private vnode?: VNode
    private symbol: Symbol = Symbol()
    public parent?: Micox
    constructor(portal?: Portal, patchTo?: Element, elementType?: string) {
        this.portal = portal
        this.elementType = elementType ? elementType : this.elementType
        this.element = patchTo ? h(this.elementType, {props: {id: patchTo.id}}) : h(this.elementType)
        this.vnode = patchTo ? patch(toVNode(patchTo), this.element) : undefined
        if(portal) this.setPortal(portal)
        else this.update()
    }
    destroy = () => {
        this.element = undefined
        if (this.parent) {
            let {parent} = this
            parent.update()
            while (parent.parent) {
                parent = parent.parent
                parent.update()
            }
        }
        return this
    }
    setPortal = (portal: Portal) => {
        this.portal = portal
        portal.registerAction(this.symbol, this.update)
        this.update()
    }
    contains = (content?: MicoxContent) => {
        this.content = content ? content : null
        if (content instanceof Micox) {
            content.parent = this
        } else if (Array.isArray(content)) {
            for (let _content of content) {
                if (_content instanceof Micox) _content.parent = this
            }
        }
        this.update()
        return this
    }
    as = (type: string) => {
        this.elementType = type
        this.update()
        return this
    }
    private setProps = (props: {[key: string]: string}) => {
        this.elementData["props"] = props
    }
    props = (props: PropsFunction | {[key: string]: string}) => {
        if (typeof props === "function")
            this.propsFunc = props
        else
            this.setProps(props)
        this.update()
        return this
    }
    id = (id: string) => {
        return this.props({id})
    }
    class = (className: string) => {
        return this.props({class: className})
    }
    private setEvents = (events: {[key: string]: (ev: any) => any}) => {
        this.elementData["on"] = events
    }
    events = (events: EventsFunction | {[key: string]: (ev: any) => any}) => {
        if (typeof events === "function")
            this.eventsFunc = events
        else
            this.setEvents(events)
        this.update()
        return this
    }
    private setAttrs = (attrs: {[key: string]: string | boolean | null}) => {
        this.elementData["attrs"] = attrs
    }
    attrs = (attrs: AttrsFunction | {[key: string]: string | boolean | null}) => {
        if (typeof attrs === "function")
            this.attrsFunc = attrs
        else
            this.setAttrs(attrs)
        this.update()
        return this
    }
    hooks = (hooks: {[key: string]: any}) => {
        this.elementData["hook"] = hooks
        return this
    }
    setPortalToContent = () => {
        if (!this.portal && typeof this.content === "function") {
            throw "Fatal: Cannot find a portal object."
        }
        return this.portal && typeof this.content === "function" ? this.content(this.portal) : this.content
    }
    update = () => {
        if (this.portal && this.propsFunc) {
            const props = this.propsFunc(this.portal)
            this.setProps(props)
        }
        if (this.portal && this.eventsFunc) {
            const events = this.eventsFunc(this.portal)
            this.setEvents(events)
        }
        if (this.portal && this.attrsFunc) {
            const events = this.attrsFunc(this.portal)
            this.setAttrs(events)
        }
        const content = this.setPortalToContent()
        
        if (typeof content === "string") {
            this.element = h(this.elementType, this.elementData, content)
        } else if (content instanceof Micox && this.element) {
            this.element = h(this.elementType, this.elementData, content.element)
        } else if (Array.isArray(content)) {
            let dom = []
            for(let _content of content) {
                if (_content && typeof _content === "function") {
                    let obj = this.portal && typeof _content === "function" ? _content(this.portal) : _content
                    if (obj instanceof Micox) dom.push(obj.element)
                    if (typeof obj === "string") dom.push(obj)
                } else if (_content && _content instanceof Micox) {
                    dom.push(_content.element)
                } else if (typeof _content === "string") dom.push(_content)
            }
            dom = dom.filter(v => v) // remove undefined objects
            if(dom.length)
                this.element = h(this.elementType, this.elementData, dom)
            else
                this.element = h(this.elementType, this.elementData)
        } else if (this.element !== undefined) {
            this.element = h(this.elementType, this.elementData)
        }
        if(this.vnode) {
            this.vnode = patch(this.vnode, this.element)
        }
    }
}

export const micoxWrapper = (name: string) => (content?: MicoxContent) => new Micox(undefined, undefined, name).contains(content)

export const html = {
    a: micoxWrapper("a"),
    article: micoxWrapper("article"),
    aside: micoxWrapper("aside"),
    body: micoxWrapper("body"),
    br: micoxWrapper("br"),
    details: micoxWrapper("details"),
    div: micoxWrapper("div"),
    h1: micoxWrapper("h1"),
    head: micoxWrapper("head"),
    header: micoxWrapper("header"),
    hgroup: micoxWrapper("hgroup"),
    hr: micoxWrapper("hr"),
    html: micoxWrapper("html"),
    footer: micoxWrapper("footer"),
    nav: micoxWrapper("nav"),
    p: micoxWrapper("p"),
    section: micoxWrapper("section"),
    span: micoxWrapper("span"),
    summary: micoxWrapper("summary"),
    base: micoxWrapper("base"),
    basefont: micoxWrapper("basefont"),
    link: micoxWrapper("link"),
    meta: micoxWrapper("meta"),
    style: micoxWrapper("style"),
    title: micoxWrapper("title"),
    button: micoxWrapper("button"),
    datalist: micoxWrapper("datalist"),
    fieldset: micoxWrapper("fieldset"),
    form: micoxWrapper("form"),
    input: micoxWrapper("input"),
    keygen: micoxWrapper("keygen"),
    label: micoxWrapper("label"),
    legend: micoxWrapper("legend"),
    meter: micoxWrapper("meter"),
    optgroup: micoxWrapper("optgroup"),
    option: micoxWrapper("option"),
    select: micoxWrapper("select"),
    textarea: micoxWrapper("textarea"),
    abbr: micoxWrapper("abbr"),
    acronym: micoxWrapper("acronym"),
    address: micoxWrapper("address"),
    b: micoxWrapper("b"),
    bdi: micoxWrapper("bdi"),
    bdo: micoxWrapper("bdo"),
    big: micoxWrapper("big"),
    blockquote: micoxWrapper("blockquote"),
    center: micoxWrapper("center"),
    cite: micoxWrapper("cite"),
    code: micoxWrapper("code"),
    del: micoxWrapper("del"),
    dfn: micoxWrapper("dfn"),
    em: micoxWrapper("em"),
    font: micoxWrapper("font"),
    i: micoxWrapper("i"),
    ins: micoxWrapper("ins"),
    kbd: micoxWrapper("kbd"),
    mark: micoxWrapper("mark"),
    output: micoxWrapper("output"),
    pre: micoxWrapper("pre"),
    progress: micoxWrapper("progress"),
    q: micoxWrapper("q"),
    rp: micoxWrapper("rp"),
    rt: micoxWrapper("rt"),
    ruby: micoxWrapper("ruby"),
    s: micoxWrapper("s"),
    samp: micoxWrapper("samp"),
    small: micoxWrapper("small"),
    strike: micoxWrapper("strike"),
    strong: micoxWrapper("strong"),
    sub: micoxWrapper("sub"),
    sup: micoxWrapper("sup"),
    tt: micoxWrapper("tt"),
    u: micoxWrapper("u"),
    var: micoxWrapper("var"),
    wbr: micoxWrapper("wbr"),
    dd: micoxWrapper("dd"),
    dir: micoxWrapper("dir"),
    dl: micoxWrapper("dl"),
    dt: micoxWrapper("dt"),
    li: micoxWrapper("li"),
    ol: micoxWrapper("ol"),
    menu: micoxWrapper("menu"),
    ul: micoxWrapper("ul"),
    caption: micoxWrapper("caption"),
    col: micoxWrapper("col"),
    colgroup: micoxWrapper("colgroup"),
    table: micoxWrapper("table"),
    tbody: micoxWrapper("tbody"),
    td: micoxWrapper("td"),
    tfoot: micoxWrapper("tfoot"),
    thead: micoxWrapper("thead"),
    th: micoxWrapper("th"),
    tr: micoxWrapper("tr"),
    noscript: micoxWrapper("noscript"),
    script: micoxWrapper("script"),
    applet: micoxWrapper("applet"),
    area: micoxWrapper("area"),
    audio: micoxWrapper("audio"),
    canvas: micoxWrapper("canvas"),
    embed: micoxWrapper("embed"),
    figcaption: micoxWrapper("figcaption"),
    figure: micoxWrapper("figure"),
    frame: micoxWrapper("frame"),
    frameset: micoxWrapper("frameset"),
    iframe: micoxWrapper("iframe"),
    img: micoxWrapper("img"),
    map: micoxWrapper("map"),
    noframes: micoxWrapper("noframes"),
    object: micoxWrapper("object"),
    param: micoxWrapper("param"),
    source: micoxWrapper("source"),
    time: micoxWrapper("time"),
    video: micoxWrapper("video")
}
