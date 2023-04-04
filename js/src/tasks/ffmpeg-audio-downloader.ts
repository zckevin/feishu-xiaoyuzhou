import { ServerStream } from "../grpc/server";
const ffmpeg = require('fluent-ffmpeg');

export class FFmpegAudioDownloader {
  constructor(
    public serverStream: ServerStream,
    public srcUrl: string,
    public dstPath: string,
    public targetAudioBitrate: string
  ) { }

  runFFmpeg(srcUrl: string, dstPath: string, targetAudioBitrate: string) {
    const serverStream = this.serverStream;
    let program = ffmpeg(srcUrl)
      .noVideo()
      .output(dstPath)
      .on('start', function (commandLine: any) {
        serverStream.write(`ffmpeg args: ${JSON.stringify(commandLine)}`);
        // console.log('args:', commandLine);
      })
      .on('codecData', function (data: any) {
        serverStream.write(`ffmpeg codec: ${JSON.stringify(data)}`);
        // console.log("codec:", data);
      });
    // Disable audio bitrate setting because it's slow.
    //
    // if (targetAudioBitrate) {
    //   program = program.audioBitrate(targetAudioBitrate);
    // }
    return new Promise((resolve, reject) => {
      program
        .on('error', function (err: any) {
          // TODO: wrap error
          console.log(err);
          reject(err);
        })
        .on('end', function () {
          serverStream.write("ffmpeg: done");
          resolve(null);
        })
        .run();
    })
  }

  async Run() {
    return this.runFFmpeg(this.srcUrl, this.dstPath, this.targetAudioBitrate);
  }
}