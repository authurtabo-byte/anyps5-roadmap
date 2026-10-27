// jsdom does not implement IntersectionObserver, and the number ticker asks for one to know when it
// is on screen. A no-op observer means "never in view", so the ticker keeps its starting text, which
// is what a test asserting structure wants.

class NoopIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly scrollMargin = "0px";
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (!("IntersectionObserver" in globalThis)) {
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = NoopIntersectionObserver;
}
