const createStore = initialState => {
  if (initialState && typeof initialState !== 'object') {
    throw new TypeError('initialState must be a `object`')
  }

  const state = initialState || {}

  return {
    getState: () => state,
    setState: changer => {
      if (changer) {
        const mutations = typeof changer === 'function' ?
          changer(state) : changer

        Object.assign(state, mutations)
      }
    },
  }
}

module.exports = createStore
