import createStore, { Store, StoreChanger } from './Store'
import { FunctionalTask } from './Task'
import NoladiusConstructor from './NoladiusConstructor'
import TaskConstructor from './TaskConstructor'

export type NoladiusOptions = {
  concurrency: number
  throwErrors: boolean
}

abstract class Noladius {
  static defaultOptions: NoladiusOptions = {
    concurrency: 1,
    throwErrors: true,
  }

  static defaultParams: object = {}

  public store: Store
  public params: object
  public options: NoladiusOptions

  constructor(context?: Noladius, options?: NoladiusOptions, params?: object, initialState?: object) {
    if (context instanceof Noladius) {
      this.store = context.store
      this.params = { ...this.constructor['defaultParams'], ...context.params }
    } else {
      this.store = createStore(initialState)
      this.params = { ...this.constructor['defaultParams'], ...params }
    }

    this.options = {
      ...this.constructor['defaultOptions'],
      ...options
    }
  }

  public get state() {
    return this.store.getState()
  }

  public setState(changer: StoreChanger) {
    this.store.setState(changer)
  }

  abstract run(): Array<FunctionalTask | TaskConstructor | NoladiusConstructor>
}

export function createNoladius(tasks, options?: NoladiusOptions): NoladiusConstructor {
  return class extends Noladius {
    constructor(context?: Noladius, newOptions?: NoladiusOptions, params?: object, initialState?: object) {
      const finalOptions = {
        ...options,
        ...newOptions,
      }

      super(context, finalOptions, params, initialState)
    }

    run() {
      return tasks
    }
  }
}

export default Noladius
