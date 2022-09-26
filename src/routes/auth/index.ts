import { User } from "@prisma/client";
import { FastifyPluginAsync, FastifyRequest } from "fastify"
import { findByCredentials } from "../../db";
import { AuthService } from "../../services/auth/authService";
import { IHeaders, IQuerystring } from '../../types/general'; 

interface IRouteGeneric {
	Querystring: IQuerystring,
	Headers: IHeaders,
}

const auth: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {

    fastify.get<IRouteGeneric>('/', {
        preValidation: (request: FastifyRequest<IRouteGeneric>, reply, done) => {
            const { username, password } = request.query
            done((!username || !password) ? new Error('All user info are required') : undefined)
        }
    },async (request, reply) => {
        const customerHeader = request.headers['h-Custom']

        const user = await findByCredentials(request.query)
        let token: string | undefined;
        if (user) {
            token = await new AuthService().generateAccessToken(user as User)
        }
        reply.code(200);
        reply.send({token});
    })

}

export default auth;
