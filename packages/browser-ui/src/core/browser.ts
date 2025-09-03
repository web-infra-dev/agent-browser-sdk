import { connect } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

import type { Browser } from 'puppeteer-core/lib/esm/puppeteer/api/Browser.js';

/**
 * https://pptr.dev/guides/running-puppeteer-in-the-browser
 */

export class CanvasBrowser {
  #element: HTMLCanvasElement;
  #wsEndpoint: string;
  #pptrBrowser: Browser;

  static async create(
    element: HTMLCanvasElement,
    options: {
      wsEndpoint: string;
    },
  ): Promise<CanvasBrowser> {
    const pptrBrowser = await connect({
      browserWSEndpoint: options.wsEndpoint,
    });

    if (!pptrBrowser) {
      throw new Error('Failed to connect to Puppeteer browser');
    }

    const version = await pptrBrowser.version();
    console.log(`Connected to Puppeteer browser version: ${version}`);

    return new CanvasBrowser(element, pptrBrowser, options);
  }

  private constructor(
    element: HTMLCanvasElement,
    pptrBrowser: Browser,
    options: {
      wsEndpoint: string;
    },
  ) {
    this.#element = element;
    this.#pptrBrowser = pptrBrowser;
    this.#wsEndpoint = options.wsEndpoint;
  }

  async destroy() {
    if (this.#pptrBrowser) {
      await this.#pptrBrowser.disconnect();
    }
  }
}
