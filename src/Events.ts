export interface Action<Type extends string = string, Payload = any> {
  type: Type,
  payload?: Payload,
}

export interface EventsReducer<Actions extends Action = Action> {
  (action: Actions, dispatch: EventsDispatch<Actions>): void
}

export type EventsDispatch<Actions extends Action = Action> = (action: Actions) => void

export type EventsReducerSubscribe<Actions extends Action = Action> = (on: EventsReducerOn<Actions>) => void

export type EventsReducerOn<Actions extends Action = Action> =
  (action: Actions | Actions['type'] | ActionFabric<Actions>, handler: EventsReducer<Actions>) => void

export function createReducer<Actions extends Action = Action>(subscribe: EventsReducerSubscribe<Actions>): EventsReducer<Actions> {
  const handlers: {
    [key: string]: EventsReducer<Actions>
  } = {}

  const on: EventsReducerOn<Actions> = (action, handler) => {
    if (typeof action === 'string') {
      handlers[action as string] = handler
    } else {
      handlers[action.type] = handler
    }
  }

  subscribe(on)

  return (action: Actions, dispatch: EventsDispatch<Actions>) => {
    const handler = handlers[action.type]
    if (handler) {
      handler(action, dispatch)
    }
  }
}

const identity = value => value

export type ActionFabric<Actions extends Action = Action> = {
  (...args: any[]): Actions,
  type?: Actions['type']
}

export function createAction<Actions extends Action = Action>(
  type: Actions['type'],
  mapper: (...args: any[]) => Actions['payload'] = identity,
): ActionFabric {
  const actionFabric: ActionFabric = (...args) => ({
    type,
    payload: mapper(...args),
  })

  actionFabric.type = type

  return actionFabric
}

export default class Events<Actions extends Action = Action> {
  private reducers: {
    [key: string]: EventsReducer,
  } = {}

  dispatch: EventsDispatch = (action: Actions) => {
    Object.values(this.reducers)
      .forEach(reducer => reducer(action, this.dispatch))
  }

  registerReducer(key: string, reducer: EventsReducer<Actions>) {
    this.reducers[key] = reducer
  }

  unregisterReducer(key: string) {
    delete this.reducers[key]
  }
}

export function createEvents<Actions extends Action = Action>() {
  return new Events<Actions>()
}
