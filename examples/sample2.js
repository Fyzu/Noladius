const {
  Noladius,
  createNoladius,
  Task,
  runner,
} = require('../lib')


const createDelayedTask = (cb, timeout) =>
  () => new Promise(resolve => {
    setTimeout(() => {
      resolve(cb())
    }, timeout)
  })

class TaskMachineCommand extends Noladius {
  constructor(context) {
    super(context)

    this.runSubTasks1 = this.runSubTasks1.bind(this)
  }

  runSubTasks1() {
    console.log('== run sub-tasks 1 ==')

    return createNoladius([
      createDelayedTask(() => console.log('1 sub-task'), 3000),
      createDelayedTask(() => console.log('2 sub-task'), 1000),
      createDelayedTask(() => console.log('3 sub-task'), 1000),
      createDelayedTask(() => console.log('4 sub-task'), 500),
    ], { concurrency: 2 })
  }

  run() {
    return [
      this.runSubTasks1,
    ]
  }
}

function runCommand(Command, params) {
  return runner(Command, params)
    .then(() => console.log('=== Complete run command ==='))
    .catch(error => console.error(error))
}

runCommand(TaskMachineCommand, {})
