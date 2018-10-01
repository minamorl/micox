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

export class Micox {
    private portal: Portal
    public element: VNode
    private elementType: string = ""
    private contentFunc: (portal: Portal) => string
    constructor(portal: Portal) {
        this.portal = portal
        this.contentFunc = _ => ""
        this.element = h("div")
        portal.registAction(Symbol(), this.update)
    }
    content = (func: (portal: Portal) => string) => {
        this.contentFunc = func
        return this
    }
    as = (type: string) => {
        this.elementType = type
        return this
    }
    update = () => {
        this.element = h(this.elementType, this.contentFunc(this.portal))
    }
}
//    .onClick(portal => portal.emit(text: "modified"))
