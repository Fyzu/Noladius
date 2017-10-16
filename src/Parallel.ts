export type ParallelOptions = {
  throwErrors?: boolean
  concurrency?: number
}

const defaultParallelOptions: ParallelOptions = {
  throwErrors: true,
  concurrency: 1,
}

export default class Parallel<TItem = any> {
  private iterable: Array<TItem>
  private options: ParallelOptions

  constructor(iterable: Array<TItem>, options?: ParallelOptions) {
    this.iterable = iterable

    this.options = {
      ...defaultParallelOptions,
      ...options,
    }
  }

  map<Result>(mapper: (item: TItem, idx: number, tasks: Array<TItem>) => PromiseLike<Result> | Result) {
    const { concurrency, throwErrors } = this.options
    const length = this.iterable.length
    const iterator = this.iterable[Symbol.iterator]()
    const results = []

    return new Promise((resolve, reject) => {
      let rejected = false
      let resolved = false
      let inProgressCount = 0

      const handleNext = () => {
        const { value, done } = iterator.next()
        if (done || resolved || rejected) {
          return
        }

        inProgressCount++

        const currentIdx = this.iterable.indexOf(value)

        Promise.resolve(value)
          .then(result => mapper(result, currentIdx, this.iterable))
          .then(
            result => {
              inProgressCount--
              results[currentIdx] = result

              if (inProgressCount === 0) {
                resolved = true

                resolve(results)
              } else {
                handleNext()
              }
            },
            error => {
              inProgressCount--
              results[currentIdx] = error

              if (throwErrors) {
                rejected = true

                reject(error)
              } else if (inProgressCount === 0) {
                resolved = true

                resolve(results)
              } else {
                handleNext()
              }
            },
          )
      }

      for (let idx = 0; idx < concurrency && idx < length; idx++) {
        handleNext()
      }
    })
  }
}
