import { chromium } from 'playwright';

export async function createPersistentContext(userDirPath: string, options: any) {
  return await chromium.launchPersistentContext(userDirPath, options);
}

export async function createNormalContext(options: any) {
  const browser = await chromium.launch(options);
  return await browser.newContext();
}
