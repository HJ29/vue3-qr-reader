export const indempotent = action => {
  let called = false;
  let result = undefined;
  return (...args) => {
    if (called) {
      return result;
    } else {
      result = action(...args);
      called = true;
      return result;
    }
  };
};

export function asyncListenEvent(eventTarget, successEvent, errorEvent) {
  let _resolve, _reject
  const promise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
  eventTarget.addEventListener(successEvent, _resolve)
  eventTarget.addEventListener(errorEvent, _reject)
  promise.finally(() => {
    eventTarget.removeEventListener(successEvent, _resolve)
    eventTarget.removeEventListener(errorEvent, _reject)
  })
  return promise
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}