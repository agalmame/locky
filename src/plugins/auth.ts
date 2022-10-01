import fastifyAuth from "@fastify/auth";
import fp from "fastify-plugin";


export default fp(async (fastify, opts) => {
    void fastify.register(fastifyAuth, {
  });
});