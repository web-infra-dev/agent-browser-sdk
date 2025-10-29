/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { MouseEventType, KeyboardEventType, MouseDetail, KeyboardDetail, WheelDetail } from '../../types';
import type { TabMeta } from './tab';
import type { DialogMeta } from './dialog';
import { MouseButton } from 'puppeteer-core';

@customElement('ai-browser-container')
export class BrowserContainer extends LitElement {
  static styles = css`
    :host {
      position: relative;
      display: block;
      overflow: hidden;
      margin: 0 auto;
      border: 0;
      border-radius: 8px;
    }

    @media (min-resolution: 2dppx) {
      :host {
        border: 0.5px solid #a8a8a8;
      }
    }

    .canvas-container {
      position: relative;
      background-color: #fff;
    }

    canvas {
      display: block;
    }
    canvas:focus {
      outline: none;
    }
  `;

  @property({ type: Array })
  tabs: TabMeta[] = [];

  @property({ type: String })
  activeTabId?: string;

  @property({ type: String })
  currentUrl = '';

  @property({ type: Boolean })
  canGoBack = false;

  @property({ type: Boolean })
  canGoForward = false;

  @property({ type: Object })
  dialog?: DialogMeta;

  @property({ type: Boolean })
  isLoading = false;

  @property({ type: Object })
  defaultViewport = { width: 1280, height: 1024 };

  #canvas: HTMLCanvasElement | null = null;

  render() {
    return html`
      <ai-browser-tab-bar
        .tabs=${this.tabs}
        .activeTabId=${this.activeTabId}
        .disabled=${!!this.dialog}
        @tab-activate=${this._handleTabActivate}
        @tab-close=${this._handleTabClose}
        @new-tab=${this._handleNewTab}
      ></ai-browser-tab-bar>

      <ai-browser-controls-bar
        .currentUrl=${this.currentUrl}
        .canGoBack=${this.canGoBack}
        .canGoForward=${this.canGoForward}
        @navigate=${this._handleNavigate}
        @navigate-action=${this._handleNavigateAction}
      ></ai-browser-controls-bar>

      <div class="canvas-container">
        <canvas
          tabindex=${99}
          width=${this.defaultViewport.width}
          height=${this.defaultViewport.height}
        ></canvas>
        <ai-browser-dialog
          .dialog=${this.dialog}
          .visible=${!!this.dialog}
          @dialog-accept=${this._handleDialogAccept}
          @dialog-dismiss=${this._handleDialogDismiss}
        ></ai-browser-dialog>
      </div>
    `;
  }

  private _handleTabActivate(event: CustomEvent<{ tabId: string }>) {
    this.dispatchEvent(
      new CustomEvent('tab-activate', {
        detail: { tabId: event.detail.tabId },
      }),
    );
  }

  private _handleTabClose(event: CustomEvent<{ tabId: string }>) {
    this.dispatchEvent(
      new CustomEvent('tab-close', {
        detail: { tabId: event.detail.tabId },
      }),
    );
  }

  private _handleNewTab() {
    this.dispatchEvent(new CustomEvent('new-tab'));
  }

  private _handleNavigate(event: CustomEvent<{ url: string }>) {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { url: event.detail.url },
      }),
    );
  }

  private _handleNavigateAction(event: CustomEvent<{ action: string }>) {
    this.dispatchEvent(
      new CustomEvent('navigate-action', {
        detail: { action: event.detail.action },
      }),
    );
  }

  private _handleDialogAccept(event: CustomEvent<{ inputValue?: string }>) {
    this.dispatchEvent(
      new CustomEvent('dialog-accept', {
        detail: { inputValue: event.detail.inputValue },
      }),
    );
  }

  private _handleDialogDismiss() {
    this.dispatchEvent(new CustomEvent('dialog-dismiss'));
  }

  connectedCallback() {
    super.connectedCallback();
    // Wait for the component to be fully rendered
    setTimeout(() => {
      this.#canvas = this.shadowRoot?.querySelector('canvas') || null;
      this._setupCanvasEvents();
    }, 0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupCanvasEvents();
    this.#canvas = null;
  }

  getCanvas() {
    return this.#canvas;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  updateTabs(tabs: TabMeta[], activeTabId?: string) {
    this.tabs = tabs;
    if (activeTabId) {
      this.activeTabId = activeTabId;
    }
  }

  updateNavigation(url: string, canGoBack: boolean, canGoForward: boolean) {
    this.currentUrl = url;
    this.canGoBack = canGoBack;
    this.canGoForward = canGoForward;
  }

  showDialog(dialog: DialogMeta) {
    this.dialog = dialog;
  }

  hideDialog() {
    this.dialog = undefined;
  }

  private _setupCanvasEvents() {
    const canvas = this.#canvas;
    if (!canvas) return;

    canvas.addEventListener('mousemove', this._handleMouse);
    canvas.addEventListener('mousedown', this._handleMouse);
    canvas.addEventListener('mouseup', this._handleMouse);

    // Auto-focus events
    canvas.addEventListener('mouseenter', this._handleMouseEnter);
    canvas.addEventListener('mouseleave', this._handleMouseLeave);

    canvas.addEventListener('wheel', this._handleWheel);

    canvas.addEventListener('keydown', this._handleKeyboard);
    canvas.addEventListener('keyup', this._handleKeyboard);
  }

  private _cleanupCanvasEvents() {
    const canvas = this.#canvas;
    if (!canvas) return;

    canvas.removeEventListener('mousemove', this._handleMouse);
    canvas.removeEventListener('mousedown', this._handleMouse);
    canvas.removeEventListener('mouseup', this._handleMouse);

    // Auto-focus events
    canvas.removeEventListener('mouseenter', this._handleMouseEnter);
    canvas.removeEventListener('mouseleave', this._handleMouseLeave);

    canvas.removeEventListener('wheel', this._handleWheel);

    canvas.removeEventListener('keydown', this._handleKeyboard);
    canvas.removeEventListener('keyup', this._handleKeyboard);
  }

  private _handleMouse = (event: MouseEvent) => {
    const canvas = this.#canvas;
    if (!canvas) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.dispatchEvent(
      new CustomEvent<MouseDetail>('canvas-mouse-event', {
        detail: {
          type: event.type as MouseEventType,
          x,
          y,
          button: this._getMouseButton(event.button),
        },
      }),
    );
  };

  private _handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(
      new CustomEvent<WheelDetail>('canvas-wheel-event', {
        detail: {
          deltaX: event.deltaX,
          deltaY: event.deltaY,
        },
      }),
    );
  };

  private _handleKeyboard = (event: KeyboardEvent) => {
    console.log('KeyboardEvent', event.type);

    this.dispatchEvent(
      new CustomEvent<KeyboardDetail>('canvas-keyboard-event', {
        detail: {
          type: event.type as KeyboardEventType,
          key: event.key,
          code: event.code,
          modifiers: this._getModifiers(event),
        },
      }),
    );
  };

  private _handleMouseEnter = () => {
    this.#canvas?.focus();
  };

  private _handleMouseLeave = () => {
    this.#canvas?.blur();
  };

  private _getMouseButton(buttonNumber: number): MouseButton {
    switch (buttonNumber) {
      case 0:
        return 'left';
      case 1:
        return 'middle';
      case 2:
        return 'right';
      case 3:
        return 'back';
      case 4:
        return 'forward';
      default:
        return 'left';
    }
  }

  private _getModifiers(event: MouseEvent | KeyboardEvent): number {
    let modifiers = 0;
    if (event.altKey) modifiers |= 1; // Alt
    if (event.ctrlKey) modifiers |= 2; // Control
    if (event.metaKey) modifiers |= 4; // Meta
    if (event.shiftKey) modifiers |= 8; // Shift
    return modifiers;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-browser-container': BrowserContainer;
  }
}