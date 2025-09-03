import type { Page } from 'puppeteer-core';
import { proxy, subscribe } from 'valtio';
import { Tab } from './tab';

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

export class Tabs {
  #tabs = new Map<string, Tab>();
  #canvas: HTMLCanvasElement;

  public state: TabsState;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    
    this.state = proxy({
      tabs: new Map<string, TabMeta>(),
      activeTabId: null,
    });
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: () => void): () => void {
    return subscribe(this.state, callback);
  }

  /**
   * 获取当前状态快照
   */
  getSnapshot(): TabsState {
    return {
      tabs: new Map(this.state.tabs),
      activeTabId: this.state.activeTabId,
    };
  }

  async createTab(
    page: Page,
    url?: string,
  ): Promise<string> {
    const tab = new Tab(page, this.#canvas);
    const tabId = tab.getTabId();

    // 只在内部 Map 中存储 Tab 实例
    this.#tabs.set(tabId, tab);

    tab.on('loadingStateChanged', () => {
      this.#syncTabMeta(tabId);
    });

    // 如果没有活跃标签页，自动激活新创建的标签页
    if (!this.state.activeTabId || this.state.tabs.size === 0) {
      await this.switchTab(tabId);
    }

    if (url) {
      await tab.goto(url);
    }

    // 同步到响应式状态 - Map 会保持插入顺序
    await this.#syncTabMeta(tabId);

    return tabId;
  }

  async closeTab(tabId: string): Promise<boolean> {
    const tab = this.#tabs.get(tabId);
    if (!tab) return false;

    await tab.close();

    this.#tabs.delete(tabId);
    this.state.tabs.delete(tabId);

    if (this.state.activeTabId === tabId) {
      this.state.activeTabId = null;
      // 获取第一个可用的标签页
      const firstTabId = this.state.tabs.keys().next().value;
      if (firstTabId) {
        await this.switchTab(firstTabId);
      }
    }

    return true;
  }

  async switchTab(tabId: string): Promise<boolean> {
    const tab = this.#tabs.get(tabId);
    if (!tab) return false;

    // 更新之前活跃 tab 的状态
    if (this.state.activeTabId && this.state.activeTabId !== tabId) {
      await this.#syncTabMeta(this.state.activeTabId);
    }

    this.state.activeTabId = tabId;
    await tab.active();

    // 更新当前活跃 tab 的状态
    await this.#syncTabMeta(tabId);

    return true;
  }

  getActiveTab(): Tab | null {
    if (!this.state.activeTabId) return null;
    return this.#tabs.get(this.state.activeTabId) || null;
  }

  getActiveTabId(): string | null {
    return this.state.activeTabId;
  }

  async getAllTabsMeta(): Promise<TabMeta[]> {
    return Array.from(this.state.tabs.values());
  }

  async goBack(): Promise<boolean> {
    const activeTab = this.getActiveTab();
    if (!activeTab) return false;

    return await activeTab.goBack(['load']);
  }

  async goForward(): Promise<boolean> {
    const activeTab = this.getActiveTab();
    if (!activeTab) return false;

    return await activeTab.goForward(['load']);
  }

  async reload(): Promise<boolean> {
    const activeTab = this.getActiveTab();
    if (!activeTab) return false;

    try {
      await activeTab.reload();
      return true;
    } catch (error) {
      console.error('Reload failed:', error);
      return false;
    }
  }

  async navigate(url: string): Promise<boolean> {
    const activeTab = this.getActiveTab();
    if (!activeTab) return false;

    try {
      await activeTab.goto(url);
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }

  getCurrentUrl(): string {
    const activeTab = this.getActiveTab();
    return activeTab ? activeTab.getUrl() : 'about:blank';
  }

  hasTab(tabId: string): boolean {
    return this.state.tabs.has(tabId);
  }

  async #syncTabMeta(tabId: string): Promise<void> {
    const tab = this.#tabs.get(tabId);
    if (!tab) return;

    const [title, favicon] = await Promise.all([
      tab.getTitle().catch(() => 'Loading...'),
      tab.getFavicon().catch(() => null),
    ]);

    const tabMeta: TabMeta = {
      id: tabId,
      title,
      url: tab.getUrl(),
      favicon,
      isLoading: false, // 可以从 tab 实例获取真实状态
      isActive: tabId === this.state.activeTabId,
    };

    this.state.tabs.set(tabId, tabMeta);
  }

  async destroy(): Promise<void> {
    const closeTasks = Array.from(this.#tabs.keys()).map((tabId) =>
      this.closeTab(tabId),
    );
    await Promise.all(closeTasks);
  }
}