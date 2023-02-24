const ffmpeg = require('fluent-ffmpeg');

class FFmpegAudioDownloader {
  constructor(srcUrl, dstPath, targetAudioBitrate) {
    this.srcUrl = srcUrl;
    this.dstPath = dstPath;
    this.targetAudioBitrate = targetAudioBitrate;
  }

  runFFmpeg(srcUrl, dstPath, targetAudioBitrate) {
    let program = ffmpeg(srcUrl)
      .output(dstPath)
      .on('start', function (commandLine) {
        console.log('args:', commandLine);
      })
      .on('codecData', function (data) {
        console.log("codec:", data);
      });
    if (targetAudioBitrate) {
      program = program.audioBitrate(targetAudioBitrate);
    }
    return new Promise((resolve, reject) => {
      program
        .on('error', function (err) {
          console.log(err);
          reject(err);
        })
        .on('end', function () {
          console.log('Finished processing');
          resolve();
        })
        .run();
    })
  }

  async Run() {
    return this.runFFmpeg(this.srcUrl, this.dstPath);
  }
}

module.exports = {
  FFmpegAudioDownloader,
}