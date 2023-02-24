const { chromium } = require('playwright');

async function createPersistentContext(userDirPath, options) {
  return await chromium.launchPersistentContext(userDirPath, options);
}

async function createNormalContext(options) {
  const browser = await chromium.launch(options);
  return await browser.newContext();
}

module.exports = {
  createPersistentContext,
  createNormalContext
}