import Noladius from './Noladius'
import { StoreChanger } from './Store'

export interface ITask {
  shouldRun?(state: object, params: object): boolean

  didRun?(state: object, params: object): StoreChanger | void

  willRun?(state: object, params: object): StoreChanger | void

  didCatch?(error: any, state: object, params: object): StoreChanger | void
}

export interface FunctionalTask extends ITask {
  (state: object, params: object): (StoreChanger | PromiseLike<StoreChanger | void> | void)
}

export interface ObjectTask extends ITask {
  run: (state: object, params: object) => (StoreChanger | PromiseLike<StoreChanger | void> | void)
}

abstract class Task implements ITask {
  static defaultParams = {}

  private context: Noladius

  constructor(context: Noladius) {
    this.context = context
  }

  shouldRun?(): boolean

  didRun?(): void

  willRun?(): void

  didCatch?(error: any): void

  protected setState(changer: StoreChanger) {
    this.context.setState(changer)
  }

  protected get state(): object {
    return this.context.state
  }

  protected get params(): object {
    return { ...this.constructor['defaultParams'], ...this.context.params }
  }

  abstract run(): void | Promise<void>
}

export default Task
