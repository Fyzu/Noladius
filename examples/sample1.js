const {
  Noladius,
  createNoladius,
  Task,
  runner,
} = require('../lib')

/**
 * Задача реализованная через наследование
 */
class ExampleTask extends Task {
  shouldRun() {
    return true
  }

  run() {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 100)
    })
  }
}

/**
 * Функциональная задача
 * @param state {object}
 * @param params {object}
 * @returns {function(object): object} - мутирует текущее состояние
 */
function FunctionalExampleTask(state, params) {
  console.info('Functional task running')

  return currentState => ({ prop: 'new' })
}

FunctionalExampleTask.shouldRun = (state, params) => {
  console.log('Functional task running skipped')

  return false
}

/**
 * Функциональная задача
 * @param state {object}
 * @param params {object}
 */
const LoggerTask = (state, params) => {
  console.log('Current state:', state)
  console.log('Current params:', params)
}

const ObjectExampleTask = {
  shouldRun: () => true,
  run: (state, params) => {
    console.log(`Current title: ${ObjectExampleTask.title}`)
    return currentState => currentState
  }
}

/**
 * Сгенеренная команда через фабрику
 */
const GeneratedExampleCommand = createNoladius([
  (state, params) => console.info('GeneratedExampleCommand message'),
  FunctionalExampleTask,
  ObjectExampleTask,
  LoggerTask,
])

/**
 * Команда реализованная через наследование
 */
class ExampleCommand extends Noladius {
  run() {
    return [
      ExampleTask,
      ObjectExampleTask,
      LoggerTask
    ]
  }
}

function runCommand(Command, params) {
  return runner(Command, params)
    .then(() => console.log('=== Complete run command ==='))
    .catch(error => console.error(error))
}

runCommand(ExampleCommand, { entry: 'class' })
  .then(() => runCommand(GeneratedExampleCommand, { entry: 'generated' }))
  .catch(error => console.log(error))
