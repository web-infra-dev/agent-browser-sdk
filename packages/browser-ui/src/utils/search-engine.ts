/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SearchEngine } from '../types';

export const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  baidu: 'https://www.baidu.com/s?wd=',
};

export function getSearchUrl(
  searchEngine: SearchEngine,
  query: string,
): string {
  const baseUrl = SEARCH_ENGINE_URLS[searchEngine];
  const encodedQuery = encodeURIComponent(query);
  return `${baseUrl}${encodedQuery}`;
}

export function processUrlForNavigation(
  url: string,
  searchEngine: SearchEngine = 'google',
): string {
  const finalUrl = url.trim();

  if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
    return finalUrl;
  }

  if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
    return `https://${finalUrl}`;
  }

  return getSearchUrl(searchEngine, finalUrl);
}
