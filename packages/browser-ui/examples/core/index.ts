import { CanvasBrowser } from '../../src/core/browser';

const canvasEle = document.getElementById('browserCanvas') as HTMLCanvasElement;

const ws =
  'ws://127.0.0.1:9222/devtools/browser/29906d41-bcd7-41bd-9582-e68237b4f966';

new CanvasBrowser(canvasEle, { wsEndpoint: ws});

