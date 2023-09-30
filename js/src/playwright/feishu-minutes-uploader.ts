import { BrowserContext } from "playwright"
import * as fs from 'fs-extra'
import { ServerStream } from "../grpc/server";
import { uploadFile } from "./playwright-library-script-feishu-minutes";
import { createNormalContext, createPersistentContext } from "./launch-context";

const homePageUrl = 'https://feishu.cn/minutes/home';
const userDirPath = './chrome-user-dir';

export class FeishuMinutesUploader {
  #context: BrowserContext | undefined;

  constructor(
    public filePath: string,
    public isDebug = false,
  ) { }

  private async clean(serverStream: ServerStream) {
    fs.removeSync(this.filePath);
    serverStream.write("playwright: cleaned");
  }

  async Close() {
    await this.#context!.close();
    await this.#context!.browser()?.close();
  }

  async UploadFile(serverStream: ServerStream, isCreatingUserDir = false) {
    // const context = await createNormalContext();
    this.#context = await createPersistentContext(userDirPath, {
      args: [
        '--remote-debugging-port=' + 9229,
      ],
      headless: !this.isDebug,
    });
    await uploadFile(serverStream, this.#context, homePageUrl, this.filePath);
    if (!isCreatingUserDir) {
      await this.clean(serverStream);
    } else {
      // wait for qrcode scan to login and save session info in chrome user dir
    }
  }
};