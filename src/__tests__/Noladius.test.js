jest.resetAllMocks()
jest.resetModules()

const Noladius = require.requireActual('../Noladius')

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
})
