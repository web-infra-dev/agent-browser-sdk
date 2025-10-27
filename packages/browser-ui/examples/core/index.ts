/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { UIBrowser } from '../../src';
import { BrowserContainer } from '../../src/core/ui';

// Import the web components to register them
import '../../src/core/ui';

// Get the browser container element
const browserContainer = document.getElementById('browserContainer') as BrowserContainer;

// Wait for the component to be ready and get the canvas element
let canvasEle: HTMLCanvasElement;
const getCanvas = () => {
  const canvas = browserContainer.getCanvas();
  if (!canvas) {
    throw new Error('Canvas element not found');
  }
  return canvas;
};

// Wait for the component to be initialized
await new Promise(resolve => {
  if (browserContainer.getCanvas()) {
    resolve(void 0);
  } else {
    setTimeout(resolve, 100);
  }
});

canvasEle = getCanvas();

const canvasBrowser = await UIBrowser.create(canvasEle, {
  // @ts-ignore
  browserWSEndpoint: import.meta.WSEndpoint,
  defaultViewport: {
    width: 900,
    height: 900,
  },
});

const tabs = canvasBrowser.tabs;

// Dialog state
let currentDialogTabId: string | null = null;

// Event handlers for the browser container
browserContainer.addEventListener('tab-activate', async (e: Event) => {
  const customEvent = e as CustomEvent;
  await tabs.activeTab(customEvent.detail.tabId);
});

browserContainer.addEventListener('tab-close', async (e: Event) => {
  const customEvent = e as CustomEvent;
  await tabs.closeTab(customEvent.detail.tabId);
});

browserContainer.addEventListener('new-tab', async () => {
  await tabs.createTab();
});

browserContainer.addEventListener('navigate', async (e: Event) => {
  const customEvent = e as CustomEvent;
  const url = customEvent.detail.url;
  let finalUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      finalUrl = `https://${url}`;
    } else {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
  }
  await tabs.navigate(finalUrl);
});

browserContainer.addEventListener('navigate-action', async (e: Event) => {
  const customEvent = e as CustomEvent;
  const action = customEvent.detail.action;
  switch (action) {
    case 'back':
      await tabs.goBack();
      break;
    case 'forward':
      await tabs.goForward();
      break;
    case 'refresh':
      await tabs.reload();
      break;
  }
});

browserContainer.addEventListener('dialog-accept', async (e: Event) => {
  const customEvent = e as CustomEvent;
  const activeTab = tabs.getActiveTab();
  if (!activeTab || !activeTab.dialog.isOpen) return;

  const promptText = customEvent.detail.inputValue;
  const success = await activeTab.dialog.accept(promptText);
  if (success) {
    browserContainer.hideDialog();
  }
});

browserContainer.addEventListener('dialog-dismiss', async () => {
  const activeTab = tabs.getActiveTab();
  if (!activeTab || !activeTab.dialog.isOpen) return;

  const success = await activeTab.dialog.dismiss();
  if (success) {
    browserContainer.hideDialog();
  }
});

// Subscribe to tabs state changes
tabs.subscribe(() => {
  updateBrowserContainer();
  updateDialog();
});

// Update browser container with current state
function updateBrowserContainer() {
  const snapshot = tabs.getSnapshot();
  const tabIds = Array.from(snapshot.tabs.keys());
  const tabsData = tabIds.map(tabId => {
    const tabMeta = snapshot.tabs.get(tabId);
    return tabMeta ? {
      id: tabId,
      title: tabMeta.title,
      favicon: tabMeta.favicon || undefined,
      isLoading: tabMeta.isLoading,
    } : null;
  }).filter((tab): tab is NonNullable<typeof tab> => tab !== null);

  const activeTab = snapshot.tabs.get(snapshot.activeTabId || '');
  const currentUrl = tabs.getCurrentUrl();

  browserContainer.updateTabs(tabsData, snapshot.activeTabId || undefined);
  browserContainer.updateNavigation(currentUrl, true, true); // TODO: Get actual navigation state

  if (activeTab?.isLoading) {
    browserContainer.setLoading(true);
  } else {
    browserContainer.setLoading(false);
  }
}

// Update dialog display
function updateDialog() {
  const snapshot = tabs.getSnapshot();
  const activeTabId = snapshot.activeTabId;

  if (!activeTabId) {
    browserContainer.hideDialog();
    return;
  }

  const activeTab = snapshot.tabs.get(activeTabId);
  if (!activeTab) {
    browserContainer.hideDialog();
    return;
  }

  if (activeTab.dialog) {
    currentDialogTabId = activeTabId;
    browserContainer.showDialog(activeTab.dialog);
  } else {
    browserContainer.hideDialog();
  }
}

// Support Escape key to dismiss dialog
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && browserContainer.dialog) {
    browserContainer.dispatchEvent(new CustomEvent('dialog-dismiss'));
  }
});

// Initial update
updateBrowserContainer();

// 清理资源
window.addEventListener('beforeunload', async () => {
  // await canvasBrowser.destroy();
});
