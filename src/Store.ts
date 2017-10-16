export type StoreListener = (state: object) => void

export default function createStore(initialState: object) {
  return new Store(initialState)
}

export type StoreChanger = object | ((state: object) => object)

export class Store {
  private state: object
  private listeners: StoreListener[]

  constructor(initialState = {}) {
    this.state = initialState
    this.listeners = []
  }

  public addListener(listener: StoreListener) {
    this.listeners.push(listener)
  }

  public removeListener(toRemove: StoreListener) {
    this.listeners = this.listeners.filter(listener => listener !== toRemove)
  }

  public getState() {
    return this.state
  }

  public setState(changer: StoreChanger) {
    let mutations = {}

    if (changer) {
      if (typeof changer === 'function') {
        mutations = changer(this.state)
      } else if (typeof changer === 'object' && !Array.isArray(changer)) {
        mutations = changer
      }
    }

    this.state = {
      ...this.state,
      ...mutations,
    }
  }
}
