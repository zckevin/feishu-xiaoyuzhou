const { XiaoyuzhoufmUrlSource } = require("./xiaoyuzhoufm");

const validEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/636a2f842da3e3939dd9eddc";
const invalidEpisodeUrl = "https://www.xiaoyuzhoufm.com/episode/aaaaava"

async function run(episodeUrl) {
  const src = new XiaoyuzhoufmUrlSource(episodeUrl);
  return await src.getResourceFileUrl();
}

test('valid episode', async () => {
  const u = await run(validEpisodeUrl);
  expect(u).toMatch(/.+\.(mp3|m4a)/);
});

test('invalid episode', async () => {
  await expect(run(invalidEpisodeUrl))
    .rejects
    .toThrow("Xiaoyuzhou: no resource found in response.");
});