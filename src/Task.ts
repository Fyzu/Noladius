import Noladius from './Noladius'
import { StoreChanger } from './Store'

export type FunctionalTask = (state: object, params: object) => (StoreChanger | PromiseLike<StoreChanger | void> | void)

abstract class Task {
  private context: Noladius

  constructor(context: Noladius) {
    this.context = context
  }

  protected setState(changer: StoreChanger) {
    this.context.setState(changer)
  }

  protected get state() {
    return this.context.state
  }

  protected get params() {
    return this.context.params
  }

  abstract run(): void | Promise<void>
}

export default Task
