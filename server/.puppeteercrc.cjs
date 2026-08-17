const { join } = require("path");

/**
 * Puppeteer configuration for cloud environment (Render / AWS / Railway).
 * Directs Chrome installation to a persistent project directory cache folder (.cache/puppeteer).
 *
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer")
};
