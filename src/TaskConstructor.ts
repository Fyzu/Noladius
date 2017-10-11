import Noladius from './Noladius'
import Task from './Task'

type TaskConstructor = { new(context: Noladius): Task }

export default TaskConstructor
