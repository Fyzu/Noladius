import Noladius from './Noladius'
import { StoreChanger } from './Store'
import NoladiusConstructor from './NoladiusConstructor'
import TaskConstructor from './TaskConstructor'

export type TaskReturnValue = (
  StoreChanger
  | NoladiusConstructor
  | PromiseLike<StoreChanger | NoladiusConstructor | void>
  | void)

export interface ITask {
  shouldRun?(state: object, params: object): boolean

  didRun?(state: object, params: object): StoreChanger | void

  willRun?(state: object, params: object): StoreChanger | void

  didCatch?(error: any, state: object, params: object): StoreChanger | void
}

export interface FunctionalTask extends ITask {
  (state: object, params: object): TaskReturnValue
}

export interface ObjectTask extends ITask {
  run(state: object, params: object): TaskReturnValue
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

  abstract run(): (void | NoladiusConstructor) | Promise<void | NoladiusConstructor>
}

export function createTask(task: ObjectTask): TaskConstructor {
  return class extends Task {
    shouldRun(): boolean {
      if (task.shouldRun) {
        return task.shouldRun(this.state, this.params)
      }

      return true
    }

    didRun(): void {
      if (task.didRun) {
        const changer = task.didRun(this.state, this.params)
        if (changer) {
          this.setState(changer)
        }
      }
    }

    willRun(): void {
      if (task.willRun) {
        const changer = task.willRun(this.state, this.params)
        if (changer) {
          this.setState(changer)
        }
      }
    }

    didCatch(error: any): void {
      if (task.didCatch) {
        const changer = task.didCatch(error, this.state, this.params)
        if (changer) {
          this.setState(changer)
        }
      }
    }

    run() {
      return Promise.resolve(task.run(this.state, this.params) as any)
        .then(value => {
          if (value) {
            if (typeof value === 'function' && value.prototype) {
              const parent = Object.getPrototypeOf(value.prototype).constructor
              if (parent && parent === Noladius) {
                return value as NoladiusConstructor
              }
            }

            if (!Array.isArray(value)) {
              this.setState(value as StoreChanger)
            }
          }
        })
    }

  }
}

export default Task
