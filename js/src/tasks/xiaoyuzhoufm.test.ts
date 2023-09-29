import { XiaoyuzhoufmUrlSource } from "./xiaoyuzhoufm";
import { getFileBitRate, DummyServerStream } from "./test-helpers";

const validEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/636a2f842da3e3939dd9eddc";
const invalidEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/aaaaava"

async function run(episodeUrl: string) {
  const src = new XiaoyuzhoufmUrlSource(new DummyServerStream());
  return await src.getResourceFileUrl(episodeUrl);
}

test('getResourceFileUrl() valid episode url', async () => {
  const { resourceFileUrl } = await run(validEpisodeUrl);
  expect(resourceFileUrl).toMatch(/.+\.(mp3|m4a)/);
});

test('getResourceFileUrl() invalid episode url', async () => {
  await expect(run(invalidEpisodeUrl))
    .rejects
    .toThrow(/Xiaoyuzhou: no resource found in response/);
});

test("Download()", async () => {
  const downloadDir = "/tmp";
  const src = new XiaoyuzhoufmUrlSource(new DummyServerStream());
  const outputFilePath = await src.Download(validEpisodeUrl, downloadDir);
  await expect(getFileBitRate(outputFilePath))
    .resolves
    .toBe(32000);
});