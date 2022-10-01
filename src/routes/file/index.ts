import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { DateTime } from "luxon";
import { findToken } from "../../db";
import { findUserById } from "../../db/user";
import { AuthService } from "../../services/auth/authService";


type AuthHeader = {
    scheme: string;
    value: string;
};
const re = /(\S+)\s+(\S+)/;

function parseAuthHeader(hdrValue: string): AuthHeader | null {
    const matches = hdrValue.match(re);
    return matches && { scheme: matches[1], value: matches[2] };
}

const verifyToken = async (request: Record<string, any>, reply: FastifyReply, done: Function) => {
    const authorizationHeader: string = request.headers.authorization ?? '';
    if(!authorizationHeader){
        done(new Error('Unauthorized'));
    }
    const header = parseAuthHeader(authorizationHeader);
    if(header){
        const id = await new AuthService().verifyAccessToken(header.value);
        const token = await findToken(header.value);
        if (token  && token.expiresAt ) {
            if (token.expiresAt < DateTime.now().toJSDate()) {
                done(new Error('Unauthorized'));
            }
        }
        if (!id) {
            done(new Error('Unauthorized'));
        }
        request.user = await findUserById(id);
        done();
    }
    done(new Error('Unauthorized'));
}


const file : FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.get('/', {
        preHandler: fastify.auth([verifyToken]),
    }, async (request: Record<string, any> , reply: FastifyReply)=>{
        reply.send({file:'file', user: request.user})
    })
}

export {file};
export default file;