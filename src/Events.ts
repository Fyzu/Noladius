export interface Action<Type extends string = string, Payload = any> {
  type: Type,
  payload?: Payload,
}

export interface EventsReducer<Actions extends Action = Action> {
  (action: Actions, dispatch: (action: Actions) => void): void
}

export type EventsDispatch<Actions extends Action = Action> = (action: Actions) => void

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
