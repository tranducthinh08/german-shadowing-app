const crypto = require('crypto');

// Polyfill crypto.getRandomValues on Node 16 so Vite 5 runs seamlessly
if (!crypto.getRandomValues && crypto.webcrypto) {
  crypto.getRandomValues = function (buffer) {
    return crypto.webcrypto.getRandomValues(buffer);
  };
}
