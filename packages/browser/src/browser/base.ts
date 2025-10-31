/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Browser as pptrBrowser, Viewport } from 'puppeteer-core';

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 2000;

/**
 * Abstract base class for browser implementations
 * Contains common functionality shared between Browser and UIBrowser
 */
export abstract class BaseBrowser<TTabs> {
  public pptrBrowser?: pptrBrowser;
  public _tabs?: TTabs;
  public _envInfo?: any;
  public wsEndpoint = '';
  public defaultViewport: Viewport = {
    width: 1280,
    height: 1024,
    deviceScaleFactor: 0,
    isMobile: false,
    isLandscape: false,
    hasTouch: false,
  };
  public isIntentionalDisconnect: boolean = false;
  public reconnectAttempts: number = 0;

  constructor() {}

  // #region tabs

  get tabs(): TTabs {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return this._tabs!;
  }

  async getTabsSnapshot() {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).getSnapshot();
  }

  async subscribeTabChange(callback: () => void) {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).subscribe(callback);
  }

  async createTab() {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).createTab();
  }

  async activeTab(tabId: string) {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).activeTab(tabId);
  }

  async closeTab(tabId: string) {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).closeTab(tabId);
  }

  async getActiveTab() {
    if (!this._tabs) {
      throw new Error('Tabs not initialized');
    }
    return (this._tabs as any).getActiveTab();
  }

  // #endregion

  // #region other methods

  get envInfo(): any {
    return this._envInfo!;
  }

  async getBrowserMetaInfo() {
    if (!this.pptrBrowser) {
      throw new Error('Browser not initialized');
    }

    const userAgent = await this.pptrBrowser.userAgent();

    return {
      envInfo: this._envInfo!,
      userAgent,
      viewport: this.defaultViewport,
      wsEndpoint: this.wsEndpoint,
    };
  }

  async disconnect(): Promise<void> {
    this.isIntentionalDisconnect = true;
    if (this._tabs && typeof (this._tabs as any).destroy === 'function') {
      await (this._tabs as any).destroy();
    }
    await this.pptrBrowser?.disconnect();
  }

  public setDefaultViewport(viewport?: Viewport | null): Viewport {
    if (!viewport) {
      return this.defaultViewport;
    }

    if (typeof viewport === 'object') {
      this.defaultViewport = {
        ...this.defaultViewport,
        ...viewport,
      };
    }

    return this.defaultViewport;
  }

  // #endregion

  // #region reconnect logic

  public setupAutoReconnect(): void {
    if (!this.pptrBrowser) return;

    this.pptrBrowser.on('disconnected', () => {
      if (this.isIntentionalDisconnect) {
        return;
      }
      this.attemptReconnect();
    });
  }

  protected abstract attemptReconnect(): Promise<void>;

  public async handleReconnectSuccess(): Promise<void> {
    this.reconnectAttempts = 0;
  }

  public shouldAttemptReconnect(): boolean {
    return this.reconnectAttempts < MAX_RETRIES && !!this.wsEndpoint;
  }

  public getReconnectDelay(): number {
    return INITIAL_BACKOFF * this.reconnectAttempts;
  }

  public incrementReconnectAttempts(): void {
    this.reconnectAttempts++;
  }

  // #endregion
}