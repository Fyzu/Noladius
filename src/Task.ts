import Noladius from './Noladius'
import { StoreChanger } from './Store'
import NoladiusConstructor from './NoladiusConstructor'
import { Action, EventsDispatch } from './Events'

export type TaskReturnValue<
  State extends object = object,
  Params extends object = object,
  Actions extends Action = Action
> = (
  StoreChanger<State>
  | NoladiusConstructor<State, Params, Actions>
  | PromiseLike<StoreChanger<State>
  | NoladiusConstructor<State, Params, Actions> | void>
  | void
)

export interface ITask<
  State extends object,
  Params extends object,
  Actions extends Action = Action
> {
  shouldRun?(state: State, params: Params): boolean

  didRun?(state: State, params: Params, dispatch: EventsDispatch<Actions>): StoreChanger<State> | void

  willRun?(state: State, params: Params, dispatch: EventsDispatch<Actions>): StoreChanger<State> | void

  didCatch?<Error = any>(error: Error, state: State, params: Params, dispatch: EventsDispatch<Actions>): StoreChanger<State> | void
}

export interface FunctionalTask<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
> extends ITask<State, Params> {
  (state: State, params: Params, dispatch: EventsDispatch<Actions>): TaskReturnValue<State, Params, Actions>
}

export interface ObjectTask<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
> extends ITask<State, Params> {
  run(state: State, params: Params, dispatch: EventsDispatch<Actions>): TaskReturnValue<State, Params, Actions>
}

abstract class Task<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
> implements ITask<State, Params, Actions> {
  static defaultParams = {}

  private context: Noladius<State, Params, Actions>

  constructor(context: Noladius<State, Params, Actions>) {
    this.context = context
  }

  shouldRun?(): boolean

  didRun?(): void

  willRun?(): void

  didCatch?(error: any): void

  protected setState(changer: StoreChanger<State>) {
    this.context.setState(changer)
  }

  protected get state(): State {
    return this.context.state as State
  }

  protected get params(): Params {
    return {
      ...this.constructor['defaultParams'],
      ...this.context.params as object,
    }
  }

  protected dispatch(action: Actions) {
    this.context.dispatch(action)
  }

  abstract run(): (
    (void | NoladiusConstructor<State, Params, Actions>) |
    Promise<void | NoladiusConstructor<State, Params, Actions>>
  )
}

export function createTask<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
>({ run, ...options }: ObjectTask<State, Params>): FunctionalTask<State, Params> {
  function Task(state: State, params: Params, dispatch: EventsDispatch<Actions>) {
    return run(state, params, dispatch)
  }

  return Object.assign(Task, options)
}

export default Task
