import createStore, { Store, StoreChanger } from './Store'
import { FunctionalTask } from './Task'
import NoladiusConstructor from './NoladiusConstructor'
import TaskConstructor from './TaskConstructor'

abstract class Noladius {
  public store: Store
  public params: object

  constructor(parent: Noladius, params?: object, initialState?: object) {
    if (parent instanceof Noladius) {
      this.store = parent.store
      this.params = parent.params
    } else {
      this.store = createStore(initialState)
      this.params = params || {}
    }
  }

  get state() {
    return this.store.getState()
  }

  setState(changer: StoreChanger) {
    this.store.setState(changer)
  }

  abstract init(): Array<FunctionalTask | TaskConstructor | NoladiusConstructor>
}

export function createNoladius(tasks): NoladiusConstructor {
  return class extends Noladius {
    init() {
      return tasks
    }
  }
}

export default Noladius
