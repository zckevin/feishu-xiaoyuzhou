import * as path from "path";
import * as grpc from '@grpc/grpc-js';
import { ServerStream } from "../grpc/server";
import { TaskConfig  } from '../proto/services/feishu/v1/feishu_service_pb';
import { FFmpegAudioDownloader } from "./ffmpeg-audio-downloader";
import { FeishuMinutesUploader } from "../playwright/feishu-minutes-uploader";
const axios = require("axios");
const fs = require("fs");

const FAKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";

export class XiaoyuzhoufmUrlSource {
  // global / multiline / dot matches newline
  readonly #regex = /<title>(.+?)<\/title>.+<meta property="og:audio" content="(.+?)"/gms;
  readonly #specialCharsRegex = /[.\\/]/g;

  constructor(public serverStream: ServerStream) { }

  async getResourceFileUrl(sourceUrl: string) {
    const response = await axios.request({
      url: sourceUrl,
      method: "GET",
      responseType: 'document',
      headers: {
        "User-Agent": FAKE_USER_AGENT,
      },
    });
    const result = this.#regex.exec(response.data);
    if (!result) {
      throw new Error(`Xiaoyuzhou: no resource found in response for url: ${sourceUrl}`);
    }
    const [_, title, resourceFileUrl] = result;
    this.serverStream.write(`title: ${title}, resource: ${resourceFileUrl}`);
    return { title, resourceFileUrl };
  }

  normalizeFileName(title: string): string {
    return title.replace(this.#specialCharsRegex, "_");
  }

  async Download(sourceUrl: string, downloadDir: string, targetBitrate: string = "") {
    const { resourceFileUrl, title } = await this.getResourceFileUrl(sourceUrl);
    const extname = path.extname(new URL(resourceFileUrl).pathname);
    if (!/\..+/.test(extname)) {
      throw new Error(`Xiaoyuzhou: invalid extname found in url ${resourceFileUrl}`)
    }
    // escape path seperators
    const outputFilePath = path.join(downloadDir, `${this.normalizeFileName(title)}${extname}`);
    const downloader = new FFmpegAudioDownloader(this.serverStream, resourceFileUrl, outputFilePath, targetBitrate);
    await downloader.Run();
    return outputFilePath;
  }
}


export async function HandleXiaoyuzhouTask(
  call: grpc.ServerUnaryCall<TaskConfig, any>,
  serverStream: ServerStream
) {
  const url = call.request.getUrl();
  // const success = limitter.AddKey(url);
  // if (!success) {
  //   console.log("duplicate task key", url);
  //   return;
  // }

  const src = new XiaoyuzhoufmUrlSource(serverStream);
  const outputFilePath = await src.Download(url, "/tmp");

  const uploader = new FeishuMinutesUploader(outputFilePath);
  await uploader.UploadFile(serverStream);
}
