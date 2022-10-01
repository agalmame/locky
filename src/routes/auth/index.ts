import { TokenTypes, User } from "@prisma/client";
import { FastifyPluginAsync, FastifyRequest } from "fastify"
import { DateTime } from "luxon";
import { findByCredentials, saveToken } from "../../db";
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
        let token: string;
        if (user) {
            token = await new AuthService().generateAccessToken(user as User)
            //TODO: make time configurable
            await saveToken(token, user.id, TokenTypes.Access, DateTime.now().plus({hours: 24}))
            reply.code(200);
            return reply.send({token});
        }
        reply.code(401);
        return reply.send({error: 'Invalid credentials'})

    })

}

export default auth;
