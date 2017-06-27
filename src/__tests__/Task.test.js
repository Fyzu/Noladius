const Task = require.requireActual('../Task')

describe('task', () => {
  it('should failed create Task', () => {
    expect(() => new Task()).toThrow()
  })
})
