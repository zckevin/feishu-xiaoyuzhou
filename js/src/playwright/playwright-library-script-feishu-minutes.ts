import { BrowserContext, Page } from "playwright-core";
import { ServerStream } from "../grpc/server";

// 5 minutes
const DEFAULT_UPLOAD_TIMEOUT = 5 * 60 * 1000;

async function doUploadFile(
  serverStream: ServerStream,
  page: Page, 
  filePath: string, 
  timeout: number,
) {
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByText('Upload local files').click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('div.upload-modal-body > div').click(),
  ]);
  await fileChooser.setFiles(filePath);

  await page.getByRole('button', { name: 'Submit' }).click();
  serverStream.write("Playwright: upload start");
  const startTime = new Date();

  await page.getByText('Upload completed', { exact: true }).waitFor({ timeout });
  const duration = (new Date().getTime() - startTime.getTime()) / 1000;
  serverStream.write(`Playwright: upload done, took ${duration}s`);
}

export async function uploadFile(
  serverStream: ServerStream,
  context: BrowserContext,
  homePageUrl: string,
  filePath: string,
  timeout: number = DEFAULT_UPLOAD_TIMEOUT
) {
  const page = await context.newPage();
  await page.goto(homePageUrl);

  const logined = await Promise.race([
    page.getByText('Scan QR Code', { exact: true }).waitFor().then(() => false),
    page.getByRole('button', { name: 'Upload' }).waitFor().then(() => true),
  ]);

  if (logined) {
    serverStream.write("Playwright: is logined")
    return await doUploadFile(serverStream, page, filePath, timeout);
  } else {
    // TODO: login
    serverStream.write("Playwright: no login info")
  }
}
