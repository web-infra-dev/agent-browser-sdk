/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConnectOptions } from 'puppeteer-core';
import type { TabsOptions, TabOptions } from '@agent-infra/browser/web';

export interface CastOptions {
  format?: 'jpeg' | 'png';
  /**
   * Compression quality from range [0..100].
   */
  quality?: number;
  /**
   * Send every n-th frame.
   */
  everyNthFrame?: number;
}

export interface UIBrowserOptions {
  connect: ConnectOptions;
  cast?: CastOptions;
}

export interface UITabOptions extends TabOptions {
  cast?: CastOptions;
}

export interface UITabsOptions extends TabsOptions {
  cast?: CastOptions;
}

export type ScreenCastOptions = Omit<UITabOptions, 'envInfo' | 'userAgentInfo'>;
