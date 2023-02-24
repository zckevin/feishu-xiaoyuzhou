const fastify = require('fastify')({ logger: false });

async function startServer(rootPath, port = 3000) {
  fastify.register(require('@fastify/static'), {
    // root: path.join(__dirname, 'public'),
    root: rootPath,
  })
  return await fastify.listen({ port });
}

async function stopServer() {
  return await fastify.close();
}

module.exports = {
  startServer,
  stopServer,
}