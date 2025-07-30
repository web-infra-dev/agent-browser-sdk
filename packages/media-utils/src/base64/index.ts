import {
  IMAGE_TYPE_MAP,
  parseBmpDimensions,
  parseGifDimensions,
  parseJpegDimensions,
  parsePngDimensions,
  parseWebpDimensions,
} from './image-parse';

import type { ImageDimensions, ImageType } from '../type';

export class Base64ImageTool {
  private pureBase64: string;
  private buffer?: Uint8Array;

  private imageType: ImageType | null = null;
  private dimensions: ImageDimensions | null = null;

  constructor(base64Image: string) {
    this.pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  }

  public getPureBase64Image(): string {
    return this.pureBase64;
  }

  public getBuffer(): Uint8Array {
    // Check if we're in Node.js environment
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      this.buffer = new Uint8Array(Buffer.from(this.pureBase64, 'base64'));
    } else {
      // Browser environment
      const binaryString = atob(this.pureBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      this.buffer = bytes;
    }

    return this.buffer;
  }

  /**
   * get image type form base64 magic number
   */
  public getImageType(): ImageType | null {
    if (this.imageType) {
      return this.imageType;
    }

    const prefix = this.pureBase64.substring(0, 8);

    for (const [signature, type] of IMAGE_TYPE_MAP) {
      if (prefix.startsWith(signature)) {
        this.imageType = type;
        break;
      }
    }

    return this.imageType;
  }

  public getDimensions(): ImageDimensions | null {
    if (this.dimensions) {
      return this.dimensions;
    }

    const imageType = this.getImageType();
    if (!imageType) {
      return null;
    }

    try {
      const bytes = this.getBuffer();

      switch (imageType) {
        case 'png':
          this.dimensions = parsePngDimensions(bytes);
          break;
        case 'jpeg':
          this.dimensions = parseJpegDimensions(bytes);
          break;
        case 'webp':
          this.dimensions = parseWebpDimensions(bytes);
          break;
        case 'gif':
          this.dimensions = parseGifDimensions(bytes);
          break;
        case 'bmp':
          this.dimensions = parseBmpDimensions(bytes);
          break;
        default:
          return null;
      }

      return this.dimensions;
    } catch (error) {
      console.warn('Failed to parse image dimensions:', error);
      return null;
    }
  }

  public getDataUri() {
    const imageType = this.getImageType();
    if (imageType) {
      return `data:image/${this.imageType};base64,${this.pureBase64}`;
    }

    return null;
  }
}
