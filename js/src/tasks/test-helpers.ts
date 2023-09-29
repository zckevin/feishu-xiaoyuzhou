const ffmpeg = require('fluent-ffmpeg');
const fastify = require('fastify')({ logger: false });

export async function startServer(rootPath, port = 3000) {
  fastify.register(require('@fastify/static'), {
    // root: path.join(__dirname, 'public'),
    root: rootPath,
  })
  return await fastify.listen({ port });
}

export async function stopServer() {
  return await fastify.close();
}

export async function getFileBitRate(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, function (err, metadata) {
      if (err) {
        return reject(err);
      }
      // console.log(metadata);
      resolve(metadata.streams[0].bit_rate);
    });
  })
}

export class DummyServerStream {
  write(payload: string) {}
}