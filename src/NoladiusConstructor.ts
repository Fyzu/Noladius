import Noladius, { NoladiusOptions } from './Noladius'

type NoladiusConstructor = {
  new(parent: Noladius, options?: NoladiusOptions, params?: object, initialState?: object): Noladius
}

export default NoladiusConstructor
