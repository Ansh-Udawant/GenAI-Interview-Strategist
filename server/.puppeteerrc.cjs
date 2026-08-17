const { join } = require("path");

/**
 * Official Puppeteer configuration file for cloud containers (Render / Railway / Heroku).
 * Directs Chrome installation to a persistent project directory cache folder (.cache/puppeteer).
 *
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer")
};
