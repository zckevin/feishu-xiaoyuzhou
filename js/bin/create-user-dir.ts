import { FeishuMinutesUploader } from "../src/playwright/feishu-minutes-uploader";
const path = require("path")

class MockServerStream {
  write(payload: string) {
    console.log(payload);
  }
}

async function run() {
  const uploader = new FeishuMinutesUploader(
    path.join(__dirname, "../static/file_example_MP3_700KB.mp3"), true);
  // @ts-ignore
  await uploader.UploadFile(new MockServerStream(), true);
}

run();