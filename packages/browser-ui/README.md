# Browser UI

A React component library that provides remote browser interaction capabilities. This package allows you to display and interact with a remote browser instance through Chrome DevTools Protocol (CDP) in your React application.

## What is this package for?

This package enables you to:

- Display a remote browser's page content in a React component
- Interact with the remote browser (mouse clicks, keyboard input, scrolling)
- Control browser instances programmatically through Puppeteer
- Build browser automation tools with visual feedback
- Create remote browser viewers or testing interfaces

The main component `BrowserCanvas` renders the browser content on an HTML5 canvas and forwards user interactions to the remote browser via CDP WebSocket connection.


## Installation

```bash
npm install @agent-infra/browser-ui
```

## Quick Start

### 1. Start a browser with remote debugging

First, you need a Chrome/Chromium browser running with remote debugging enabled:

```javascript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/path/to/chrome',
  headless: false,
  args: []
});

console.log('WebSocket endpoint:', browser.wsEndpoint());
```

## API Reference

### BrowserCanvas Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `wsEndpoint` | `string` | No* | CDP WebSocket URL for browser connection |
| `cdpEndpoint` | `string` | No* | CDP HTTP endpoint (higher priority than wsEndpoint) |
| `onReady` | `(ctx: {browser: Browser, page: Page}) => void` | No | Callback when browser connection is established |
| `onError` | `(error: Error) => void` | No | Error callback for connection/runtime errors |
| `onSessionEnd` | `() => void` | No | Callback when browser session ends |
| `defaultViewport` | `Viewport` | No | Initial viewport configuration |
| `style` | `React.CSSProperties` | No | Custom CSS styles for the canvas |

*Either `wsEndpoint` or `cdpEndpoint` is required.

## Advanced Usage

The component will automatically fetch the WebSocket URL from the CDP endpoint.


## How It Works

1. **Connection**: The component connects to a remote browser via CDP WebSocket
2. **Screencast**: Uses CDP's `Page.startScreencast` to receive live screenshots
3. **Rendering**: Screenshots are rendered on an HTML5 canvas element
4. **Interaction**: Mouse and keyboard events are captured and forwarded via CDP's `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent`
5. **Scaling**: The canvas automatically scales to fit its container while maintaining aspect ratio

## Requirements

- Node.js >= 20.x
- Chrome/Chromium browser with remote debugging support
- Network access to CDP WebSocket endpoint

## License

Apache License 2.0.

## Credits

Special thanks to the open source projects that inspired this toolkit:

- [puppeteer](https://github.com/puppeteer/puppeteer) - The underlying browser automation library
