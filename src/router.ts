import {Portal, MicoxContent, Micox} from "."
import URI from "urijs"

type ConditionCallback = (portal: Portal) => boolean
type MetaMicoxContent = (props: IDestructedURL) => MicoxContent

class NoWindowObjectError extends Error {}

class PreconditionNotSatisfiedError extends Error {}
class PostconditionNotSatisfiedError extends Error {}

export interface IRouteOptions {
    fallback?: boolean
}

export interface IDestructedURL {
    path: string
    query: string
    fragment: string
    data?: {[key: string]: string}
    match: boolean
}

export const destructURL = (input: string, pattern: string) => {
    const uri = URI(input)
    const query = uri.query()
    const fragment = uri.fragment()
    const path = uri.path()
    // {:string}
    const normalizedPattern = pattern.split("/").filter(v => v && v !== "")
    const normalizedInput = input.split("/").filter(v => v && v !== "")
    if (normalizedInput.length !== normalizedPattern.length)
        return {path, query, fragment, match: false} as IDestructedURL
    
    let data: {[key: string]: string} = {}
    for (const [i, pattern] of normalizedPattern.entries()) {
        const patternRegex = /{:([^{}]+)}/g.exec(pattern)
        if (patternRegex) {
            data[patternRegex[1]] = normalizedInput[i]
        } else if (normalizedInput[i] !== normalizedPattern[i]) {
            return {path, query, fragment, match: false} as IDestructedURL
        }
    }
    const result: IDestructedURL = {
        query,
        fragment,
        path,
        data,
        match: true
    }
    return result
}
export class Router {
    window: Window
    routes: Route[] = []
    micox?: Micox
    constructor() {
        if (!window) throw new NoWindowObjectError("Router needs window object.")
        this.window = window
    }
    redirect(path: string) {
        let fallback: Route | null = null
        for (const route of this.routes) {
            const destructed = destructURL(path, route.pattern)
            if (route.options && route.options.fallback === true) {
                fallback = route
            }
            if (destructed.match) {
                this.window.history.pushState(null, "", path)
                this.micox && this.micox.contains(route.component(destructed)) && this.micox.update()
                return
            }
        }
        if (fallback) {
            const destructed = destructURL(path, fallback.pattern)
            this.window.history.pushState(null, "", path)
            this.micox && this.micox.contains(fallback.component(destructed)) && this.micox.update()
        }
    }
    route(route: string, component: MetaMicoxContent, options?: IRouteOptions) {
        const routeObj = new Route(route, component, options)
        this.routes.push(routeObj)
        return routeObj
    }
}
export class Route {
    pattern: string
    component: MetaMicoxContent
    options?: IRouteOptions
    constructor(pattern: string, component: MetaMicoxContent, options?: IRouteOptions) {
        this.pattern = pattern
        this.component = component
        this.options = options
    }
    
}