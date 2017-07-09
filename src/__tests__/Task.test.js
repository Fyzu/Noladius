const R = require.requireActual('ramda')
const Task = require.requireActual('../Task')
const { chainActionsOverState } = require.requireActual('../store')

describe('Task', () => {
  describe('examples', () => {
    const getDataFromServer = url => Promise.resolve({
      fromUrl: url,
      data: {
        items: [
          {
            name: 'Test 1',
            val: 10000,
          },
        ],
      },
    })

    const createSetterActions = prop => data => Task.actions(() => ({ [prop]: data }))

    const handleResponse = R.compose(createSetterActions('plugins'), R.prop('items'), R.prop('data'))

    it('should success run example task', () => {
      expect.assertions(3)

      const run = R.compose(R.chain(handleResponse), Task.of, getDataFromServer, R.prop('url'))

      const state = {
        url: 'Test',
      }

      expect(() => {
        run(state).fork(
          error => {
            console.error(error)
            throw error
          },
          ([, actions]) => {
            const result = chainActionsOverState(state, actions)

            expect(result).not.toBe(state)

            expect(result).toEqual({
              url: 'Test',
              plugins: [
                {
                  name: 'Test 1',
                  val: 10000,
                },
              ],
            })
          }
        )
      }).not.toThrow()
    })
  })
})
