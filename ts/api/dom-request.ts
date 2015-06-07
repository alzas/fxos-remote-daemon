/// <reference path="../../typings/mozilla/navigator.d.ts" />

export default class DOMRequest<T> implements IDOMRequest<T> {
  private result: T;
  constructor(result: T) {
    this.result = result;
  }

  then() {
    return Promise.resolve<T>(this.result);
  }
}