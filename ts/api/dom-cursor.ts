/// <reference path="../../typings/mozilla/navigator.d.ts" />

export default class DOMCursor<T> implements IDOMCursor<T> {
  result: T;
  onsuccess: () => void;
  onerror: () => void;

  private iterator: Iterator<T>;

  constructor(iterator: Iterator<T>) {
    this.iterator = iterator;

   this.moveCursor();
  }

  continue() {
    this.moveCursor();
  }

  private moveCursor() {
    var iteratorResult = this.iterator.next();

    if (this.onsuccess) {
      setTimeout(() => {
        this.result = iteratorResult.done ? null : iteratorResult.value;
        this.onsuccess.call(this);
      });
    }
  }
}