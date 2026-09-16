// Original path artwork for the imprint. No icon fonts or text glyphs.
const paths = {
  discovery:
    '<path d="m4 17 5-10 6 8 5-11"/><circle cx="4" cy="17" r="2" fill="currentColor" stroke="none"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="2" fill="currentColor" stroke="none"/><circle cx="20" cy="4" r="2" fill="currentColor" stroke="none"/><path d="M3 22h18"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="m5 19 14-14M6 5h13v13"/>',
  ornament:
    '<path d="M12 12C5 12 3 8 4 4c4-1 8 1 8 8Zm0 0c0-7 4-9 8-8 1 4-1 8-8 8Zm0 0c7 0 9 4 8 8-4 1-8-1-8-8Zm0 0c0 7-4 9-8 8-1-4 1-8 8-8Z"/><path d="m10 12 2-2 2 2-2 2Z" fill="currentColor" stroke="none"/>',
  practice:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  guidance: '<path d="M6 3h12v18l-6-4-6 4V3Z"/><path d="M9 7h6m-6 4h4"/>',
  candidates:
    '<rect x="3" y="3" width="18" height="18" rx=".5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18M5 5h1m5 0h1m5 0h1M5 11h1m11 0h1m-7 6h1"/>',
  mastery: '<path d="m12 2 9 10-9 10-9-10 9-10Z"/><path d="m8 12 3 3 5-6"/>',
};
export const publisherPaths =
  '<path d="M8 12c8-2 16 0 24 5 8-5 16-7 24-5v35c-9-1-17 1-24 6-7-5-15-7-24-6V12Z"/><path d="M32 17v36M4 17v35c10-1 19 1 28 7 9-6 18-8 28-7V17M14 22c4 0 8 1 12 3m-12 5c4 0 8 1 12 3m-12 5 7 1M38 25c4-2 8-3 12-3m-12 11c4-2 8-3 12-3m-7 9 7-1"/>';
export function icon(name, className = "") {
  if (!Object.hasOwn(paths, name)) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
export function publisherMark(className = "") {
  return `<svg class="publisher-mark ${className}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${publisherPaths}</svg>`;
}
