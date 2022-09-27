import fastifyAuth from "@fastify/auth";
import fp from "fastify-plugin";

/**
 * @fastify/helmet enables the use of helmet in a Fastify application.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
export default fp(async (fastify, opts) => {
    void fastify.register(fastifyAuth, {
  });
});