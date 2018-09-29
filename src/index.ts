class Portal {
    public sets: any
    constructor(x: Set<(states: any) => void>) {
        this.sets = x
    }
    run(states: any) {
        for (let set of this.sets)
            set(states)
    }
}


const portal = new Portal(new Set([
    (states: any) => console.log(states.text)
]))

portal.run({text: "message"})