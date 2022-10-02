import { FastifyInstance, FastifyPluginOptions, FastifyTypeProvider, FastifyTypeProviderDefault, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerBase, RawServerDefault } from "fastify";
import { FastifyReply } from "fastify";

import { AuthService } from "../../services/auth/authService";


type MyPluginInstance = FastifyInstance & {verifyToken: (request: Record<string, any>, reply: FastifyReply, done: Function)=> Promise<void> };

const file  = async (fastify: MyPluginInstance , _opts: FastifyPluginOptions): Promise<void> => {
    fastify.register(require('@fastify/auth'))
    fastify.get('/', {
        preHandler: fastify.auth([fastify.verifyToken]),
    }, async (request: Record<string, any> , reply: FastifyReply)=>{
        reply.send({file:'file', user: request.user})
    })
}

export {file};
export default file;