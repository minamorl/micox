import {Portal, MicoxContent, Micox} from "."
import URI from "urijs"

type ConditionCallback = (portal: Portal) => boolean
type MetaMicoxContent = (props: any) => MicoxContent

class NoWindowObjectError extends Error {}

class PreconditionNotSatisfiedError extends Error {}
class PostconditionNotSatisfiedError extends Error {}

interface IDestructedURL {
    path: string
    query: string
    fragment: string
    data: {[key: string]: string}
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
        return false
    
    let data: {[key: string]: string} = {}
    for (const [i, pattern] of normalizedPattern.entries()) {
        const patternRegex = /{:([^{}]+)}/g.exec(pattern)
        if (patternRegex) {
            data[patternRegex[1]] = normalizedInput[i]
        } else if (normalizedInput[i] !== normalizedPattern[i]) {
            return false
        }
    }
    const result: IDestructedURL = {
        query: query,
        fragment: fragment,
        path: path,
        data: data
    }
    return result
}
// export class Router {
//     window: Window
//     routes: Route[] = []
//     constructor() {
//         if (!window) throw new NoWindowObjectError("Router needs window object.")
//         this.window = window
//     }
//     redirect(path: string) {
//         // this.window.history.pushState(null, "", path)
//         console.log(path)
//     }
    
//     route(route: string, component: MetaMicoxContent) {
//         const routeObj = new Route(route, component)
//         this.routes.push(routeObj)
//         return routeObj
//     }
// }

// export class Route {
//     pattern: string
//     component: MetaMicoxContent
//     constructor(pattern: string, component: MetaMicoxContent) {
//         this.pattern = pattern
//         this.component = component
//     }
//     parsePattern(str: string) {
//         new URITemplate(this.pattern)
//     }
    
// }