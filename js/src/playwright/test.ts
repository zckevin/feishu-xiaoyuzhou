import { FeishuMinutesUploader } from "./feishu-minutes-uploader";
const path = require("path");

class TestServerStream {
  write(msg: string) {
    console.log(msg);
  }
}

async function run() {
  const uploader = new FeishuMinutesUploader(
    path.join(__dirname, "../../static/file_example_MP3_700KB.mp3"), true);
  await uploader.UploadFile(new TestServerStream(), true);
}
run();
