// 5 minutes
const DEFAULT_UPLOAD_TIMEOUT = 5 * 60 * 1000;

async function doUploadFile(page, filePath, timeout) {
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByText('Upload local files').click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('div.upload-modal-body > div').click(),
  ]);
  await fileChooser.setFiles(filePath);

  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByText('Upload completed', { exact: true }).waitFor({ timeout });
}

async function uploadFile(context, homePageUrl, filePath, timeout = DEFAULT_UPLOAD_TIMEOUT) {
  const page = await context.newPage();
  await page.goto(homePageUrl);

  const logined = await Promise.race([
    page.getByText('Scan QR Code', { exact: true }).waitFor().then(() => false),
    page.getByRole('button', { name: 'Upload' }).waitFor().then(() => true),
  ]);

  if (logined) {
    return await doUploadFile(page, filePath, timeout);
  } else {
    console.log("wait for login")
  }
}

module.exports = {
  uploadFile,
}