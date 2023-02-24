const path = require("path")
const axios = require("axios");
const { FFmpegAudioDownloader } = require("../ffmpeg-audio-downloader");

const FAKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";

class XiaoyuzhoufmUrlSource {
  constructor(sourceUrl) {
    this.sourceUrl = sourceUrl;
    this.regex = /<title>(.+?)<\/title>.+<meta property="og:audio" content="(.+?)"/;
  }

  async getResourceFileUrl() {
    const response = await axios.request({
      url: this.sourceUrl,
      method: "GET",
      responseType: 'document',
      headers: {
        "User-Agent": FAKE_USER_AGENT,
      },
    });
    const result = this.regex.exec(response.data);
    if (!result) {
      throw new Error("Xiaoyuzhou: no resource found in response.");
    }
    const [_, title, resourceFileUrl] = result;
    return { title, resourceFileUrl };
  }

  async Download(downloadDir, targetBitrate = "96k") {
    const { resourceFileUrl, title } = await this.getResourceFileUrl();
    const extname = path.extname(new URL(resourceFileUrl).pathname);
    if (!/\..+/.test(extname)) {
      throw new Error(`Xiaoyuzhou: invalid extname found in url ${resourceFileUrl}`)
    }
    const outputFilePath = path.join(downloadDir, `${title}${extname}`);
    const downloader = new FFmpegAudioDownloader(resourceFileUrl, outputFilePath, targetBitrate);
    await downloader.Run();
    return outputFilePath;
  }
}

module.exports = {
  XiaoyuzhoufmUrlSource,
}