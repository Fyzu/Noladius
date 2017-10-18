const {
  Noladius,
  createNoladius,
  Task,
  createReducer,
  createAction,
  runner,
} = require('../lib')

const handleTriggerAction = ({ type, payload }) => {
  console.log(`-- trigger action '${type}' --`)
  console.log(payload)
}

const runAction = createAction('FIRST_TASK/RUN')

class EventsExampleCommand extends Noladius {
  willRun() {
    this.registerReducer('events', createReducer(on => {
      on(runAction, handleTriggerAction)
    }))
  }

  run() {
    return [
      (state, params, dispatch) => {
        console.log('First task run')

        dispatch(runAction({ state, params }))
      }
    ]
  }
}

EventsExampleCommand.defaultParams = {
  myProp: 'prop',
}

EventsExampleCommand.initialState = {
  entry: 'events'
}

function runCommand(Command, params) {
  return runner(Command, params)
    .then(() => console.log('=== Complete run command ==='))
    .catch(error => console.error(error))
}

runCommand(EventsExampleCommand, {})
