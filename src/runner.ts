import Noladius from './Noladius'
import Task, { FunctionalTask } from './Task'
import TaskConstructor from './TaskConstructor'
import NoladiusConstructor from './NoladiusConstructor'
import pMap = require('p-map')

function runTask(Constructor: TaskConstructor, context: Noladius): Promise<void> {
  const task = new Constructor(context)

  return Promise.resolve()
    .then(() => task.run())
}

function runFunctionalTask(task: FunctionalTask, context: Noladius): Promise<void> {
  return Promise.resolve()
    .then(() => task(context.state, context.params))
    .then(changer => {
      if (changer) {
        context.setState(changer)
      }
    })
}

function runCommand(Constructor: NoladiusConstructor, context: Noladius): Promise<void> {
  const command = new Constructor(context)
  const tasks = command.init()

  return runTasks(tasks, context)
}

function runTasks(tasks: Array<FunctionalTask | TaskConstructor | NoladiusConstructor>, context: Noladius): Promise<any> {
  return pMap(
    tasks,
    task => {
      if (task.prototype) {
        const parent = Object.getPrototypeOf(task.prototype).constructor

        if (parent === Task) {
          return runTask(task as TaskConstructor, context)
        } else if (parent === Noladius) {
          return runCommand(task as NoladiusConstructor, context)
        }
      }

      return runFunctionalTask(task as FunctionalTask, context)
    },
    { concurrency: 1 },
  )
}

function runner(Command: NoladiusConstructor, params?: object, initialState?: object) {
  const context = new Command(null, params, initialState)

  const tasks = context.init()

  return runTasks(tasks, context)
}

export default runner
