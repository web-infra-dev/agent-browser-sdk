import type { MouseButton } from 'puppeteer-core';

export type MouseEventType = 'mousemove' | 'mousedown' | 'mouseup'

export type KeyboardEventType = 'keydown' | 'keyup';

export interface MouseDetail {
  type: MouseEventType;
  x: number;
  y: number;
  button: MouseButton;
}

export interface WheelDetail {
  deltaX: number;
  deltaY: number;
}

export interface KeyboardDetail {
  type: KeyboardEventType;
  key: string;
  code: string;
  modifiers: number;
}
