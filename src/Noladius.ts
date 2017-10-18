import createStore, { Store, StoreChanger } from './Store'
import { FunctionalTask } from './Task'
import NoladiusConstructor from './NoladiusConstructor'
import TaskConstructor from './TaskConstructor'
import Events, { Action, createEvents, EventsDispatch, EventsReducer } from './Events'

export type NoladiusOptions = {
  concurrency?: number
  throwErrors?: boolean
}

abstract class Noladius<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
> {
  static defaultOptions: NoladiusOptions = {
    concurrency: 1,
    throwErrors: true,
  }

  static defaultParams: object = {}

  static initialState: object = {}

  public store: Store<State>
  public events: Events<Actions>
  public params: Params
  public options: NoladiusOptions

  constructor(
    context?: Noladius<State, Params, Actions>,
    options?: NoladiusOptions,
    params?: Params,
  ) {
    if (context instanceof Noladius) {
      this.store = context.store
      this.params = { ...this.constructor['defaultParams'], ...context.params as object }
      this.events = context.events
    } else {
      this.store = createStore(this.constructor['initialState'])
      this.events = createEvents<Actions>()
      this.params = { ...this.constructor['defaultParams'], ...params as object }
    }

    this.options = {
      ...this.constructor['defaultOptions'],
      ...options,
    }
  }

  public shouldRun?(): boolean

  public willRun?(): void

  public didRun?(): void

  public get state(): State {
    return this.store.getState()
  }

  public setState(changer: StoreChanger<State>) {
    this.store.setState(changer)
  }

  public dispatch: EventsDispatch<Actions> = (action: Actions) => {
    this.events.dispatch(action)
  }

  public registerReducer(key: string, reducer: EventsReducer<Actions>) {
    this.events.registerReducer(key, reducer)
  }

  public unregisterReducer(key: string) {
    this.events.unregisterReducer(key)
  }

  abstract run(): Array<
    FunctionalTask<State>
    | TaskConstructor<State, Params, Actions>
    | NoladiusConstructor<State, Params, Actions>
  >
}

export function createNoladius<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
>(tasks, options?: NoladiusOptions): NoladiusConstructor<State, Params, Actions> {
  return class extends Noladius<State, Params, Actions> {
    constructor(context?: Noladius<State, Params, Actions>, newOptions?: NoladiusOptions, params?: Params) {
      const finalOptions = {
        ...options,
        ...newOptions,
      }

      super(context, finalOptions, params)
    }

    run() {
      return tasks
    }
  }
}

export default Noladius
