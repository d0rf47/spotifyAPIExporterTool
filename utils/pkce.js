// ============================================
// PKCE (Proof Key for Code Exchange) UTILITIES
// ============================================

const crypto = require('crypto');

/**
 * Generate random string for code verifier
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.randomBytes(length);
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
}

/**
 * Generate code challenge from verifier
 * @param {string} verifier - Code verifier
 * @returns {string} Code challenge
 */
function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE pair (verifier and challenge)
 * @returns {object} Object with verifier and challenge
 */
function generatePKCEPair() {
  const verifier = generateRandomString(64);
  const challenge = generateCodeChallenge(verifier);
  return { verifier, challenge };
}

module.exports = {
  generateRandomString,
  generateCodeChallenge,
  generatePKCEPair
};

