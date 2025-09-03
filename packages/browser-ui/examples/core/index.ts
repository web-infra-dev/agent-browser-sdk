import { CanvasBrowser } from '../../src/core/browser';

const canvasEle = document.getElementById('browserCanvas') as HTMLCanvasElement;

const ws =
  'ws://127.0.0.1:9222/devtools/browser/WS_ENDPOINT';

const canvasBrowser = await CanvasBrowser.create(canvasEle, {
  wsEndpoint: ws,
});

