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
    registAction(identity: Symbol, action: Action) {
        return this.actions.set(identity, action)
    }
 }
type ContainableObject = string | Array<Micox>
export class Micox {
    private portal: Portal
    public element: VNode
    private elementType: string = "div"
    private contentFunc: (portal: Portal) => ContainableObject
    private patchTo?: Element
    constructor(portal: Portal, patchTo?: Element) {
        this.portal = portal
        this.contentFunc = _ => ""
        this.element = h(this.elementType)
        this.patchTo = patchTo
        portal.registAction(Symbol(), this.update)
    }
    contains = (func: (portal: Portal) => ContainableObject) => {
        this.contentFunc = func
        this.update()
        return this
    }
    as = (type: string) => {
        this.elementType = type
        this.update()
        return this
    }
    update = () => {
        const content =  this.contentFunc(this.portal)
        if (typeof content === "string") {
            this.element = h(this.elementType, content)
        } else {
            let dom = []
            for(let micoxObj of content) {
                dom.push(micoxObj.element)
            }
            this.element = h(this.elementType, {}, dom)
        }
        if(this.patchTo) patch(this.patchTo, this.element)
    }
}