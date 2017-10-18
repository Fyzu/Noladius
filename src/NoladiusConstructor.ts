import Noladius, { NoladiusOptions } from './Noladius'
import { Action } from './Events'

type NoladiusConstructor<
  State extends object = object,
  Params extends object = object,
  Actions extends Action = Action
> = {
  new(
    parent: Noladius<State, Params, Actions>,
    options?: NoladiusOptions,
    params?: Params,
  ): Noladius<State, Params, Actions>

  initialState: object

  defaultParams: object
}

export default NoladiusConstructor
