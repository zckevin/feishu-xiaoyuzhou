const { uploadFile } = require("./feishu-upload");
const { createNormalContext, createPersistentContext } = require("./launch-context");

const homePageUrl = 'https://bcoe2qyrja.feishu.cn/minutes/home';
const filePath = '/home/zc/2.m4a';
const userDirPath = './chrome-user-dir';

(async () => {
  const optionsForDebug = { headless: false };
  // const context = await createNormalContext(optionsForDebug);
  const context = await createPersistentContext(userDirPath, optionsForDebug);
  await uploadFile(context, homePageUrl, filePath);

  console.log('done')
  // ---------------------
  // await context.close();
  // await browser.close();
})();