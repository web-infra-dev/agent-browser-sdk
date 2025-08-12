import { connect } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

import type { Browser } from 'puppeteer-core/lib/esm/puppeteer/api/Browser.js';

/**
 * https://pptr.dev/guides/running-puppeteer-in-the-browser
 */

export class CanvasBrowser {
  #element: HTMLCanvasElement;
  #wsEndpoint: string;

  #pptrBrowser: Browser | undefined = undefined;

  constructor(
    element: HTMLCanvasElement,
    options: {
      wsEndpoint: string;
    },
  ) {
    this.#element = element;
    this.#wsEndpoint = options.wsEndpoint;

    this.init();
  }

  async init() {
    this.#pptrBrowser = await connect({
      browserWSEndpoint: this.#wsEndpoint,
    });

    if (!this.#pptrBrowser) {
      throw new Error('Failed to connect to Puppeteer browser');
    }

    const vesrion = await this.#pptrBrowser.version();
    console.log(`Connected to Puppeteer browser version: ${vesrion}`);
  }

  async destroy() {
    if (this.#pptrBrowser) {
      await this.#pptrBrowser.disconnect();
    }
  }
}
