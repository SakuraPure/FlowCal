/* eslint-disable no-restricted-globals */
self.onmessage = (e: MessageEvent) => {
  if (e.data === "start") {
    // Clear any existing interval just in case
    if ((self as any).timerId) {
      clearInterval((self as any).timerId);
    }

    (self as any).timerId = setInterval(() => {
      self.postMessage("tick");
    }, 1000);
  } else if (e.data === "stop") {
    if ((self as any).timerId) {
      clearInterval((self as any).timerId);
      (self as any).timerId = null;
    }
  }
};

export {};
