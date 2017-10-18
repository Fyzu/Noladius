import Noladius from './Noladius'
import Task from './Task'
import { Action } from './Events'

type TaskConstructor<
  State extends object = {},
  Params extends object = {},
  Actions extends Action = Action
> = {
  new(context: Noladius<State, Params, Actions>): Task
}

export default TaskConstructor
