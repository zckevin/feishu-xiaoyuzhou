const { XiaoyuzhoufmUrlSource } = require("./xiaoyuzhoufm");
const { getFileBitRate } = require("./test-helpers");

const validEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/636a2f842da3e3939dd9eddc";
const invalidEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/aaaaava"

async function run(episodeUrl) {
  const src = new XiaoyuzhoufmUrlSource(episodeUrl);
  return await src.getResourceFileUrl();
}

test('getResourceFileUrl() valid episode url', async () => {
  const { resourceFileUrl } = await run(validEpisodeUrl);
  expect(resourceFileUrl).toMatch(/.+\.(mp3|m4a)/);
});

test('getResourceFileUrl() invalid episode url', async () => {
  await expect(run(invalidEpisodeUrl))
    .rejects
    .toThrow("Xiaoyuzhou: no resource found in response.");
});

test("Download()", async () => {
  const downloadDir = "/tmp";
  const targetBitrate = "96k";
  const src = new XiaoyuzhoufmUrlSource(validEpisodeUrl);
  const outputFilePath = await src.Download(downloadDir, targetBitrate);
  await expect(getFileBitRate(outputFilePath))
    .resolves
    .toBe(96000);
});