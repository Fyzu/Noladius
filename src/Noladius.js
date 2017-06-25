class Noladius {
  static createDefaultOptions() {
    return {}
  }

  constructor(initialState = {}, options) {
    this.options = Object.assign(Noladius.createDefaultOptions(), options)
    this.store = {}
  }
}

module.exports = Noladius
