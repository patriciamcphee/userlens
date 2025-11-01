// utils/urlParams.ts
export function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function removeQueryParam(param: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.replaceState({}, '', url.toString());
}