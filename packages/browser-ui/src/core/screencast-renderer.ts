import {
  Observable,
  fromEvent,
  tap,
  filter,
  concatMap,
  takeUntil,
  catchError,
  EMPTY,
  map,
} from 'rxjs';
import { EventEmitter } from 'eventemitter3';

import {
  Page,
  CDPSession,
  CDPEvents,
  EventType,
  Protocol,
} from 'puppeteer-core';

import { drawBase64ToCanvas } from '../utils/image';

interface ScreenCastOptions {
  format?: 'jpeg' | 'png';
  /**
   * Compression quality from range [0..100].
   */
  quality?: number;
  /**
   * screenshot width.
   */
  width?: number;
  /**
   * screenshot height.
   */
  height?: number;
  /**
   * Send every n-th frame.
   */
  everyNthFrame?: number;
}

export class ScreencastRenderer extends EventEmitter {
  #page: Page;
  #tabId: string;
  #options: Required<ScreenCastOptions>;
  #cdpSession?: CDPSession;

  #observable: Observable<void> | null = null;
  #controller = new AbortController();

  constructor(page: Page, tabId: string, options: ScreenCastOptions = {}) {
    super();
    this.#page = page;
    this.#tabId = tabId;

    this.#options = {
      format: 'jpeg',
      quality: 80,
      width: 1280,
      height: 720,
      everyNthFrame: 1,
      ...options,
    };
  }

  async #initCDPSession(): Promise<void> {
    if (!this.#cdpSession) {
      this.#cdpSession = await this.#page.createCDPSession();
    }
  }

  #createScreencastObservable(canvas: HTMLCanvasElement): Observable<void> {
    if (!canvas.getContext('2d')) {
      throw new Error('Cannot get 2D context from canvas');
    }

    const screencastFrameObservable =
      new Observable<Protocol.Page.ScreencastFrameEvent>((subscriber) => {
        const listener = (event: Protocol.Page.ScreencastFrameEvent) => {
          subscriber.next(event);
        };

        this.#cdpSession!.on('Page.screencastFrame', listener);

        return () => {
          this.#cdpSession!.off('Page.screencastFrame', listener);
        };
      });

    return screencastFrameObservable.pipe(
      tap((event) => {
        this.#cdpSession!.send('Page.screencastFrameAck', {
          sessionId: event.sessionId,
        });
      }),
      filter((event) => {
        return event.metadata.timestamp !== undefined;
      }),
      map((event) => {
        return event.data;
      }),
      concatMap((base64String) => {
        return drawBase64ToCanvas(
          canvas,
          base64String,
          this.#options.width,
          this.#options.height,
        );
      }),
      catchError((error) => {
        console.error('Failed to process screencast frame:', error);
        return EMPTY;
      }),
      takeUntil(fromEvent(this.#controller.signal, 'abort')),
    );
  }

  async start(canvas: HTMLCanvasElement): Promise<void> {
    try {
      await this.#initCDPSession();

      await this.#cdpSession!.send('Page.startScreencast', {
        format: this.#options.format,
        quality: this.#options.quality,
        maxWidth: this.#options.width,
        maxHeight: this.#options.height,
        everyNthFrame: this.#options.everyNthFrame,
      });

      this.#observable = this.#createScreencastObservable(canvas);

      this.#observable.subscribe({
        next: () => {
          // 帧处理成功
        },
        error: (error) => {
          console.error('Screencast stream error:', error);
          this.stop();
        },
        complete: () => {
          console.log('Screencast stream completed');
        },
      });
    } catch (error) {
      console.error('Failed to start screencast:', error);
      this.#observable = null;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.#cdpSession) {
      return;
    }

    if (this.#controller.signal.aborted) {
      return;
    }

    await this.#cdpSession.send('Page.stopScreencast');
    this.#controller.abort();

    await this.#cdpSession.detach();
    this.#cdpSession = undefined;
  }

  get tabId(): string {
    return this.#tabId;
  }
}
