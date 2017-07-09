const R = require('ramda')

const chainActionsOverState = R.reduce((currentState, action) =>
  Object.assign({}, currentState, action(currentState))
)

const createStore = initialState => {
  if (initialState && typeof initialState !== 'object') {
    throw new TypeError('initialState must be a `object`')
  }

  const state = initialState || {}

  return {
    getState: () => state,
    setState: changer => {
      if (changer) {
        let mutations = changer
        if (typeof changer === 'function') {
          mutations = changer(state)
        } else if (Array.isArray(changer)) {
          mutations = chainActionsOverState(state, changer)
        }

        Object.assign(state, mutations)
      }
    },
  }
}

module.exports = {
  createStore,
  chainActionsOverState,
}
