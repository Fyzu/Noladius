jest.resetAllMocks()
jest.resetModules()

const R = require.requireActual('ramda')
const Noladius = require.requireActual('../Noladius')
const Task = require.requireActual('../Task')
const { createStore } = require.requireActual('../store')

describe('noladius', () => {
  let originalConsoleLog

  beforeAll(() => {
    originalConsoleLog = console.log
  })

  afterAll(() => {
    Object.defineProperty(console, 'log', {
      value: originalConsoleLog,
    })
  })

  beforeEach(() => {
    Object.defineProperty(console, 'log', {
      value: jest.fn(),
    })
  })

  it('should create instance', () => {
    const noladius = new Noladius()

    expect(noladius).toBeDefined()
  })

  it('should add task', () => {
    const taskOptions = {
      title: 'Task',
      execute: R.compose(Task.of),
    }
    const noladius = new Noladius()

    noladius.add(taskOptions)

    expect(noladius.tasks.length).toBe(1)

    noladius.add([taskOptions, taskOptions])

    expect(noladius.tasks.length).toBe(3)

    noladius.add([taskOptions], taskOptions, [taskOptions], [])

    expect(noladius.tasks.length).toBe(6)
  })

  it('should success run', async () => {
    const noladius = new Noladius({
      initialState: {
        count: 1,
      },
    })

    const addAction = val => state => ({
      count: state.count + val,
    })

    const divideAction = val => state => ({
      count: state.count / val,
    })

    const subAction = val => addAction(-val)

    noladius.add(
      {
        title: 'Task 1',
        execute: () => Task.actions(addAction(2)),
      },
      {
        title: 'Task 2',
        execute: () => R.concat(
          Task.actions(subAction(6)),
          Task.actions(divideAction(2))
        ),
      }
    )

    await expect(noladius.run().catch(console.error)).resolves.toEqual({
      count: -1.5,
    })
  })

  it('should failed run', async () => {
    const errorMessage = 'failed run task'
    const noladius = new Noladius()

    noladius.add({
      title: 'Failed task',
      execute: () => {
        throw new Error(errorMessage)
      },
    })

    await expect(noladius.run()).rejects.toHaveProperty('message', errorMessage)
  })

  it('should success set custom store', () => {
    expect(() => new Noladius({ store: createStore() })).not.toThrow()
  })

  it('should success run with disabled task', async () => {
    const noladius = new Noladius()

    noladius.add({
      title: 'Failed task',
      enabled: () => false,
      execute: () => {
        throw new Error()
      },
    })

    await expect(noladius.run()).resolves.toBeDefined()
  })

  it('should failed run multiple task with throws', async () => {
    const errorMessage1 = 'error 1'
    const errorMessage2 = 'error 2'
    const noladius = new Noladius({ throws: false })

    noladius.add({
      title: 'Failed task 1',
      execute: () => {
        throw new Error(errorMessage1)
      },
    }, {
      title: 'Failed task 2',
      execute: () => {
        throw new Error(errorMessage2)
      },
    })

    const result = expect(noladius.run()).rejects
    await result.toHaveProperty('errors.0.message', errorMessage1)
    await result.toHaveProperty('errors.1.message', errorMessage2)
  })

  describe('setConcurrency', () => {
    it('should success set', () => {
      const context = {}

      Noladius.prototype.setConcurrency.call(context, 1)
      expect(context.concurrency).toBe(1)

      Noladius.prototype.setConcurrency.call(context, true)
      expect(context.concurrency).toBe(Infinity)
    })

    it('should failed set', () => {
      expect(() => Noladius.prototype.setConcurrency.call(null, false)).toThrow()
    })
  })

  describe('setStore', () => {
    it('should failed set', () => {
      expect(() => Noladius.prototype.setStore.call(null, {})).toThrow()
    })
  })
})
