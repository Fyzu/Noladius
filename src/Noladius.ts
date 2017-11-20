import createStore, { Store, StoreChanger } from './Store'
import { FunctionalTask } from './Task'
import NoladiusConstructor from './NoladiusConstructor'
import TaskConstructor from './TaskConstructor'
import Events, { Action, createEvents, EventsDispatch, EventsReducer } from './Events'

export interface NoladiusOptions {
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

  public store: Store<State>
  public events: Events<Actions>
  public params: Params
  public options: NoladiusOptions

  constructor(
    context?: Noladius<State, Params, Actions>,
    options?: NoladiusOptions,
    params?: Params,
    initialState?: State,
  ) {

    const constructor = this.constructor as NoladiusConstructor

    if (context instanceof Noladius) {
      this.store = context.store
      this.params = { ...constructor.defaultParams, ...context.params as object } as Params
      this.events = context.events
    } else {
      this.store = createStore(initialState)
      this.events = createEvents<Actions>()
      this.params = { ...constructor.defaultParams, ...params as object } as Params
    }

    this.options = {
      ...constructor.defaultOptions,
      ...options,
    }
  }

  public shouldRun?(): boolean

  public willRun?(): void

  public didRun?(): void

  public get state(): Partial<State> {
    return this.store.getState()
  }

  public set state(state: Partial<State>) {
    this.store.setState(state)
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
    FunctionalTask
    | TaskConstructor
    | NoladiusConstructor
  >
}

export function createNoladius<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
>(
  tasks: Array<FunctionalTask | TaskConstructor | NoladiusConstructor>,
  options?: NoladiusOptions,
): NoladiusConstructor<State, Params, Actions> {
  return class extends Noladius<State, Params, Actions> {
    constructor(context?: Noladius<State, Params, Actions>, newOptions?: NoladiusOptions, params?: Params, initialState?: State) {
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
