import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { findUserById } from "../../db/user";
import { AuthService } from "../../services/auth/authService";


const verifyToken = async (request: Record<string, any>, reply: FastifyReply, done: Function) => {
    const {token} = request.headers;

    const id = await new AuthService().verifyAccessToken(token as string);

    if (!id) {
        done(new Error('Unauthorized'));
    }
    request.user = await findUserById(id);
    done();
}
const file : FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.get('/', {
        preHandler: fastify.auth([verifyToken]),
    }, async (request: FastifyRequest, reply: FastifyReply)=>{
        reply.send({file:'file'})
    })
}

export {file};
export default file;