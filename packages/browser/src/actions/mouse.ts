/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Page,
  Point,
  MouseClickOptions,
  MouseMoveOptions,
} from 'puppeteer-core';
import { ScrollDirection } from '../types';

export class Mouse {
  #vision: VisionMouse;

  constructor(page: Page) {
    this.#vision = new VisionMouse(page);
  }

  get vision() {
    return this.#vision;
  }

  // Future: can add DOM mouse support here
  // get dom() {
  //   return this.#dom;
  // }
}

export class VisionMouse {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  async click(
    x: number,
    y: number,
    options: Omit<MouseClickOptions, 'clickCount'> = {},
  ): Promise<void> {
    await this.#page.mouse.click(x, y, {
      count: options.count,
      delay: options.delay,
      button: options.button,
    });
  }

  async move(
    x: number,
    y: number,
    options: MouseMoveOptions = {},
  ): Promise<void> {
    await this.#page.mouse.move(x, y, {
      steps: options.steps,
    });
  }

  async drag(
    start: Point,
    end: Point,
    options: {
      delay?: number;
    } = {},
  ): Promise<void> {
    await this.#page.mouse.dragAndDrop(start, end, {
      delay: options.delay,
    });
  }

  async scroll(
    direction: ScrollDirection,
    delta: number,
  ): Promise<void> {
    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case 'up':
        break;
      case 'down':
        deltaY = delta;
        break;
      case 'left':
        deltaX = -delta;
        break;
      case 'right':
        deltaX = delta;
        break;
    }

    await this.#page.mouse.wheel({ deltaX, deltaY });
  }
}