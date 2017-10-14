import Noladius from './Noladius'
import { StoreChanger } from './Store'

export type FunctionalTask = (state: object, params: object) => (StoreChanger | PromiseLike<StoreChanger | void> | void)

abstract class Task {
  private context: Noladius
  public title: string

  constructor(context: Noladius) {
    this.context = context
  }

  protected setState(changer: StoreChanger) {
    this.context.setState(changer)
  }

  protected get state(): object {
    return this.context.state
  }

  protected get params(): object {
    return this.context.params
  }

  public getTitle(): string {
    return this.title || this.constructor.name
  }

  abstract run(): void | Promise<void>
}

export default Task
