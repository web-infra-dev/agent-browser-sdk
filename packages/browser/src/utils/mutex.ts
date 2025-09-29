/**
 * The following code is modified based on
 * https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/src/util/Mutex.ts
 *
 * Copyright 2024 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 * https://github.com/puppeteer/puppeteer/blob/main/LICENSE
 */

export class Mutex {
  static Guard = class Guard {
    #mutex: Mutex;
    #onRelease?: () => void;
    constructor(mutex: Mutex, onRelease?: () => void) {
      this.#mutex = mutex;
      this.#onRelease = onRelease;
    }
    [Symbol.dispose](): void {
      this.#onRelease?.();
      return this.#mutex.release();
    }
  };

  #locked = false;
  #acquirers: Array<() => void> = [];

  // This is FIFO.
  async acquire(
    onRelease?: () => void,
  ): Promise<InstanceType<typeof Mutex.Guard>> {
    if (!this.#locked) {
      this.#locked = true;
      return new Mutex.Guard(this);
    }

    const { promise, resolve } = Promise.withResolvers<void>();
    this.#acquirers.push(resolve);
    await promise;

    return new Mutex.Guard(this, onRelease);
  }

  release(): void {
    const resolve = this.#acquirers.shift();
    if (!resolve) {
      this.#locked = false;
      return;
    }
    resolve();
  }
}