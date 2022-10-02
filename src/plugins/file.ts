import fp from "fastify-plugin";


export default fp(async (fastify, opts) => {
    void fastify.register(require('@fastify/multipart'), {
  });
});