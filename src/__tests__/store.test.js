const createStore = require.requireActual('../store')

describe('store', () => {
  it('should failed create store', () => {
    expect(() => createStore(100)).toThrow()
  })
})
