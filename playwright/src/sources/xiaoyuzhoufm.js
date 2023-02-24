const axios = require('axios');

const FAKE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";

class XiaoyuzhoufmUrlSource {
  constructor(sourceUrl) {
    this.sourceUrl = sourceUrl;
    this.regex = /meta property="og:audio" content="(.+?)"/;
  }

  async getResourceFileUrl() {
    const response = await axios.request({
      url: this.sourceUrl,
      method: "get",
      responseType: 'document',
      headers: {
        "User-Agent": FAKE_USER_AGENT,
      },
    });
    const result = this.regex.exec(response.data);
    if (!result) {
      throw new Error("Xiaoyuzhou: no resource found in response.");
    }
    const [_, resourceFileUrl] = result;
    return resourceFileUrl;
  }
}

module.exports = {
  XiaoyuzhoufmUrlSource,
}