const {
  Noladius,
  createNoladius,
  Task,
  runner
} = require('../lib')

/**
 * Задача реализованная через наследование
 */
class ExampleTask extends Task {
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

/**
 * Сгенеренная команда через фабрику
 */
const GeneratedExampleCommand = createNoladius([
  /**
   * Функциональный таск
   * @param state {object}
   * @param params {object}
   */
  (state, params) => console.info('GeneratedExampleCommand message')
])

/**
 * Команда реализованная через наследование
 */
class ExampleCommand extends Noladius {
  init() {
    return [
      ExampleTask,
      /**
       * Функциональный таск
       * @param state {object}
       * @param params {object}
       */
      (state, params) => {
        console.dir('Current state:', state)
        console.dir('Current params:', params)
      },
    ]
  }
}

runner(ExampleCommand, { param: 'param' })
  .then(() => console.log('Complete'))
  .catch(error => console.error(error))
