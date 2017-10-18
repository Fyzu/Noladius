const {
  Noladius,
  createNoladius,
  Task,
  runner,
} = require('../lib')

function eventsReducer({ type, payload }) {
  console.log(`-- trigger event '${type}' --`)
  console.log(payload)
}


class EventsExampleCommand extends Noladius {
  willRun() {
    this.registerReducer('events', eventsReducer)
  }

  run() {
    return [
      (state, params, dispatch) => {
        console.log('First task run')

        dispatch({ type: 'FIRST_TASK/RUN', payload: { state, params }})
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
