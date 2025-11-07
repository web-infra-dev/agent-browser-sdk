<div align="right">
  <a href="browser-ui.zh-CN.md">简体中文</a> | <b>English</b>
</div>

# Introduction

**@agent-infra/browser-ui** is a CDP-based browser remote casting solution. It implements basic capability encapsulation based on **@agent-infra/browser** and can be directly referenced as a Web component by web pages.

Users only need to provide a CDP WebSocket URL with permissions, and **@agent-infra/browser-ui** can display the remote browser's page, and you can also manually intervene in browser operations, which is very useful in scenarios without VNC and headless browser.

# Quick Start

## Installation

```bash
npm install @agent-infra/browser-ui
```

## Usage

```typescript
import { BrowserUI } from '@agent-infra/browser-ui';

const container = document.getElementById('browserContainer');
if (!container) {
  throw new Error('Browser container element not found');
}

BrowserUI.create({
  root: container,
  browserOptions: {
    connect: {
      browserWSEndpoint: 'https://example.com/ws/url',
    },
  },
});
```

## Configuration Options

### browserOptions

| Property     | Type             | Default    | Description                                                                                           |
| ------------ | ---------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| connect      | `ConnectOptions` | -          | Browser connection configuration, see [ConnectOptions](https://pptr.dev/api/puppeteer.connectoptions) |
| cast         | `CastOptions`    | optional   | Screenshot casting configuration                                                                      |
| searchEngine | `SearchEngine`   | `'google'` | Search engine configuration, supports `'google'`, `'bing'`, `'baidu'`                                 |

#### CastOptions

| Property      | Type              | Default  | Description                                                   |
| ------------- | ----------------- | -------- | ------------------------------------------------------------- |
| format        | `'jpeg' \| 'png'` | `'jpeg'` | Screenshot format                                             |
| quality       | `number` (0-100)  | `80`     | Compression quality, only effective for JPEG format           |
| everyNthFrame | `number`          | `1`      | Send every n-th frame to reduce network transmission overhead |

# Features

Since CDP is a debugging protocol, **@agent-infra/browser-ui** based on CDP cannot fully implement all browser operations.

Based on existing APIs, we have implemented the following common features that can meet users' 90% of remote takeover needs:

## Tab Switching

We use related APIs to display all tabs of the remote browser and implement basic functions like `switchTab`/`createTab`/`closeTab`:

<p>
<video src="https://github.com/user-attachments/assets/21e1ef6b-8977-48ac-895a-0e76ee07c26d" controls="true" width="600"></video>
</p>

## Navigation

Within a single tab, you can implement basic functions like `goBack`/`goForward`/`reload`/`goto`:

<p>
<video src="https://github.com/user-attachments/assets/f6e805c2-8545-4ca7-85fb-8641054880a4" controls="true" width="600"></video>
</p>

## Dialog

If there are blocking popups like `Alert`/`Confirm` on the page, **@agent-infra/browser-ui** can also display them in real-time and synchronously respond to status:

<p>
<video src="https://github.com/user-attachments/assets/524c899d-0f61-4de3-9242-3b25c7c48d73" controls="true" width="600"></video>
</p>

## Mouse Input

Basic mouse operations like `move`/`hover`/`click`/`drag` are well supported:

<p>
<video src="https://github.com/user-attachments/assets/fe29fbe1-4791-4942-9a98-6c38ae55d727" controls="true" width="600"></video>
</p>

## Keyboard Input

Keyboard input is also supported, including some common hotkeys (such as `select all`/`copy`/`cut`/`paste`, etc.):

<p>
<video src="https://github.com/user-attachments/assets/1dbcd845-45e3-4f5d-b001-a6b4338bb034" controls="true" width="600"></video>
</p>

## Clipboard Simulation

Since CDP does not support remote computer clipboard operations, but there is indeed a need for copy-paste functionality in actual business, we simulated the clipboard through some APIs.

The clipboard calling logic is: if you enter text to be copied to the remote browser in the clipboard component on the side of **@agent-infra/browser-ui**, then **browser-ui** will send the clipboard content to the remote browser when executing the `paste` hotkey (generally `Ctrl+V`).

```typescript
// Pseudo code as follows:
if (clipboardContent && isPasteHotkey) {
  await keyboard.sendCharacter(clipboardContent);
  return;
}
```

<p>
<video src="https://github.com/user-attachments/assets/001811a4-5a15-441e-a007-b93ad841f592" controls="true" width="600"></video>
</p>
