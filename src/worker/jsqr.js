import workerString from './built-worker.js';

export default () => {
  /* eslint-disable no-undef */
  return new Worker(workerString);
  /* eslint-enable */
};
