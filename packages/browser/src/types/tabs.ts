/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  Viewport,
  Protocol,
  PuppeteerLifeCycleEvent,
} from 'puppeteer-core';

export interface TabsOptions {
  viewport: Viewport;
}

export interface TabOptions extends TabsOptions {
  tabId: string;
}

export const enum TabEvents {
  TabLoadingStateChanged = 'tabLoadingStateChanged',
  TabUrlChanged = 'tabUrlChanged',
  TabVisibilityChanged = 'TabVisibilityChanged',
  TabDialog = 'TabDialog',
}

export interface TabEventsMap {
  [TabEvents.TabLoadingStateChanged]: {
    tabId: string;
    isLoading: boolean;
  };
  [TabEvents.TabUrlChanged]: {
    tabId: string;
    oldUrl: string;
    newUrl: string;
  };
  [TabEvents.TabVisibilityChanged]: {
    tabId: string;
    isVisible: boolean;
  };
  [TabEvents.TabDialog]: {
    type: Protocol.Page.DialogType;
    message: string;
    defaultValue: string;
    accept: (promptText?: string) => Promise<void>;
    dismiss: () => Promise<void>;
  };
}

export interface TabMeta {
  id: string;
  title: string;
  url: string;
  favicon: string | null;
  isLoading: boolean;
  isActive: boolean;
}

export interface TabsState {
  tabs: Map<string, TabMeta>;
  activeTabId: string | null;
}

export interface TabsOperationTracker {
  creatingTargetIds: Set<string>;
  switchingTargetIds: Set<string>;
  closingTargetIds: Set<string>;
}

export interface NavigationOptions {
  waitUntil?: PuppeteerLifeCycleEvent[];
  timeout?: number;
}
