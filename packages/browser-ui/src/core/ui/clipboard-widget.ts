/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ai-browser-clipboard')
export class ClipboardWidget extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .widget-toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #3265cb;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      margin-bottom: 8px;
    }

    .widget-toggle:hover {
      background-color: #2850a6;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .widget-toggle svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .widget-content {
      position: absolute;
      bottom: 56px;
      right: 0;
      width: 240px;
      padding: 8px 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.2s ease;
    }

    .widget-content.expanded {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .widget-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      margin-bottom: 8px;
    }

    .clipboard-input {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border: 1px solid #e1e3e1;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
    }

    .clipboard-input:focus {
      border-color: #3265cb;
    }
  `;

  @property({ type: Boolean })
  expanded = false;

  @property({ type: String })
  clipboardContent = '';

  #inputRef: HTMLTextAreaElement | null = null;

  render() {
    return html`
      <div class="widget-container">
        <button
          class="widget-toggle"
          @click=${this.#toggleWidget}
          title="Clipboard Manager"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="9" height="13" x="9" y="9" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>

        <div class="widget-content ${this.expanded ? 'expanded' : ''}">
          <h3 class="widget-title">Clipboard</h3>
          <textarea
            class="clipboard-input"
            .value=${this.clipboardContent}
            @input=${this.#handleInputChange}
            placeholder="Enter Text..."
            ref=${(el: HTMLTextAreaElement) => {
              this.#inputRef = el;
            }}
          ></textarea>
        </div>
      </div>
    `;
  }

  #toggleWidget() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      // Focus input when expanded
      setTimeout(() => {
        this.#inputRef?.focus();
      }, 200);
    }
  }

  #handleInputChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.clipboardContent = target.value;

    // Dispatch event to notify external components of content change
    this.dispatchEvent(
      new CustomEvent('clipboard-change', {
        detail: { content: this.clipboardContent },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Public method to set clipboard content from external sources
  setClipboardContent(content: string) {
    this.clipboardContent = content;
    if (this.#inputRef) {
      this.#inputRef.value = content;
    }
  }

  // Public method to get current clipboard content
  getClipboardContent() {
    return this.clipboardContent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-browser-clipboard': ClipboardWidget;
  }
}