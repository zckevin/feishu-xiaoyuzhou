import { BrowserContext, Page, errors } from "playwright";
import { ServerStream } from "../grpc/server";

// 5 minutes
const DEFAULT_UPLOAD_TIMEOUT = 5 * 60 * 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  // enable lang auto detect
  page.locator('.detect-lang input').click(),
  // submit
  await page.getByRole('button', { name: 'Submit' }).click();

  const startTime = new Date();
  serverStream.write("playwright: upload start");
  await page.getByText('Upload completed', { exact: true }).waitFor({ timeout });
  const duration = (new Date().getTime() - startTime.getTime()) / 1000;
  serverStream.write(`playwright: upload done, took ${duration}s`);
}

async function enableFileSharing(
  serverStream: ServerStream,
  page: Page,
  context: BrowserContext,
) {
  const groupName = 'feishu-xiaoyuzhou';
  const firstItemHref = await page.locator('div.meeting-list-item-wrapper > a').first().getAttribute('href');
  if (!firstItemHref) {
    serverStream.write("playwright: error: no first item href found");
    return;
  }
  serverStream.write(`playwright: first item href: ${firstItemHref}`);
  const itemPage = await context.newPage();
  await itemPage.goto(firstItemHref);
  while (true) {
    try {
      await itemPage.getByRole('button', { name: 'Share' }).click({
        timeout: 5000,
      });
    } catch (err) {
      if (err instanceof errors.TimeoutError) {
        serverStream.write("playwright: share button not found, refresh");
        itemPage.reload();
        continue;
      } else {
        throw err;
      }
    }
    break;
  }
  await itemPage.locator("div.invite-member-name-entry input").type(groupName);
  await itemPage.getByText(groupName).click();
  await itemPage.getByRole('button', { name: 'Send' }).click();
  serverStream.write("playwright: file sharing enabled");
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
    serverStream.write("playwright: is logined")
    await doUploadFile(serverStream, page, filePath, timeout);
    // wait for items list to be updated
    await sleep(1000);
    await enableFileSharing(serverStream, page, context);
    // wait for network requests to be done before closing the browser
    await sleep(3000);
  } else {
    // TODO: login
    serverStream.write("playwright: no login info")
  }
}
