/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function <T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  } {
    let resolveFn: (value: T | PromiseLike<T>) => void;
    let rejectFn: (reason?: any) => void;
    const newPromise = new Promise<T>((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });
    return {
      promise: newPromise,
      resolve: resolveFn!,
      reject: rejectFn!,
    };
  };
}

export {};
