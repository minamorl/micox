const snabbdom = require('snabbdom');
const patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners').default, // attaches event listeners
])

import {h} from "snabbdom/h"
import {VNode} from "snabbdom/vnode"

export type Action = (states: {}) => void
export class Portal {
    private actions: Map<Symbol, Action>
    private states: Map<string, any> = new Map()
    constructor() {
        this.actions = new Map()
    }
    transfer(states: Map<string, any>) {
        this.states = new Map([...this.states, ...states])
        for (let action of this.actions)
            action[1](states)
    }
    get(name: string, defaultStr: string) {
        return this.states.has(name) ? this.states.get(name) : defaultStr
    }
    registerAction(identity: Symbol, action: Action) {
        return this.actions.set(identity, action)
    }
 }
type ContainableObject = string | Array<Micox>
type ContentFunction = (portal: Portal) => ContainableObject
export class Micox {
    private portal?: Portal
    public element: VNode
    private elementType: string = "div"
    private elementData: {[key: string]: any} = {}
    private contentFunc: ContentFunction
    private staticContent: string | null = null
    private patchTo?: Element
    constructor(portal?: Portal, patchTo?: Element) {
        this.portal = portal
        this.contentFunc = _ => ""
        this.element = h(this.elementType)
        this.patchTo = patchTo
        if(portal) portal.registerAction(Symbol(), this.update)
    }
    contains = (content: ContentFunction | string) => {
        if (typeof content === "string")
            this.staticContent = content
        else
            this.contentFunc = content
        this.update()
        return this
    }
    as = (type: string) => {
        this.elementType = type
        this.update()
        return this
    }
    props = (props: {[key: string]: string}) => {
        this.elementData["props"] = {...this.elementData["props"], ...props}
        this.update()
        return this
    }
    update = () => {
        const content = (this.portal && !this.staticContent) ? this.contentFunc(this.portal) : this.staticContent
        if (typeof content === "string") {
            this.element = h(this.elementType, this.elementData, content)
        } else if (content !== null) {
            let dom = []
            for(let micoxObj of content) {
                micoxObj.update()
                dom.push(micoxObj.element)
            }
            this.element = h(this.elementType, this.elementData, dom)
        } else {
            this.element = h(this.elementType, this.elementData)
        }
        if(this.patchTo) patch(this.patchTo, this.element)
    }
}
