const path = require('path');
const { FFmpegAudioDownloader } = require("./ffmpeg-audio-downloader");
const { startServer, stopServer, getFileBitRate } = require("./test-helpers");

const inputFileName = "file_example_MP3_700KB.mp3";
const outputFile = `/tmp/${inputFileName}.mp3`;
const targetAudioBitrate = 96000;

async function run(srcUrl) {
  const downloader = new FFmpegAudioDownloader(srcUrl, outputFile, "96k");
  await downloader.Run();
}

test('valid local file', async () => {
  const sourceFile = path.join(__dirname, `../../static/${inputFileName}`);
  await expect(run(sourceFile)).resolves.toBe();
  await expect(getFileBitRate(outputFile)).resolves.toBe(targetAudioBitrate);
});

test('valid http file', async () => {
  await startServer(path.join(__dirname, "../../static/"), 4000);
  await expect(run(`http://localhost:4000/${inputFileName}`)).resolves.toBe();
  await expect(getFileBitRate(outputFile)).resolves.toBe(targetAudioBitrate);
  await stopServer();
});