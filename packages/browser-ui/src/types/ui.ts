/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Protocol } from 'puppeteer-core';

export interface TabMeta {
  id: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
}

export interface DialogMeta {
  type: Protocol.Page.DialogType;
  message: string;
  defaultValue?: string;
}
