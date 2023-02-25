const { XiaoyuzhoufmUrlSource } = require("../src/sources/xiaoyuzhoufm");

async function run() {
  const downloadDir = "/tmp";
  const targetBitrate = "96k";
  const src = new XiaoyuzhoufmUrlSource("https://www.xiaoyuzhoufm.com/episode/63f230a6e99bdef7d3112192");
  await src.Download(downloadDir, targetBitrate);
}
run()