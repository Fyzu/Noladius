export type StoreListener<State extends object = object> = (state: State) => void

export default function createStore<State extends object = object>(initialState: State) {
  return new Store(initialState)
}

export type StoreChanger<State extends object = object> = object | ((state: State) => object)

export class Store<State extends object = object> {
  private state: State
  private listeners: StoreListener<State>[]

  constructor(initialState: State = {} as State) {
    this.state = initialState
    this.listeners = []
  }

  public addListener(listener: StoreListener<State>) {
    this.listeners.push(listener)
  }

  public removeListener(toRemove: StoreListener<State>) {
    this.listeners = this.listeners.filter(listener => listener !== toRemove)
  }

  public getState(): State {
    return this.state
  }

  public setState(changer: StoreChanger<State>) {
    let mutations = {}

    if (changer) {
      if (typeof changer === 'function') {
        mutations = changer(this.state)
      } else if (typeof changer === 'object' && !Array.isArray(changer)) {
        mutations = changer
      }
    }

    this.state = {
      ...this.state as Object,
      ...mutations,
    } as State
  }
}
