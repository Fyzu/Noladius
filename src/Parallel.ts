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
      let resolvedCount = 0

      const handleNext = () => {
        const { value, done } = iterator.next()
        if (done || resolved || rejected) {
          return
        }

        const currentIdx = this.iterable.indexOf(value)

        Promise.resolve(value)
          .then(result => mapper(result, currentIdx, this.iterable))
          .then(
            result => {
              resolvedCount++
              results[currentIdx] = result

              if (resolvedCount === length) {
                resolved = true

                resolve(results)
              } else {
                handleNext()
              }
            },
            error => {
              resolvedCount++
              results[currentIdx] = error

              if (throwErrors) {
                rejected = true

                reject(error)
              } else if (resolvedCount === length) {
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

export function createParallel<TItem = any>(iterable: Array<TItem>, options?: ParallelOptions) {
  return new Parallel<TItem>(iterable, options)
}
