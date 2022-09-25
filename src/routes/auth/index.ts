import { FastifyPluginAsync, FastifyRequest } from "fastify"
import { findByCredentials } from "../../db";
import { IHeaders, IQuerystring } from '../../types/general'; 

interface IRouteGeneric {
	Querystring: IQuerystring,
	Headers: IHeaders,
}

const auth: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {

    fastify.get<IRouteGeneric>('/', {
        preValidation: (request: FastifyRequest<IRouteGeneric>, reply, done) => {
            const { username, password } = request.query
            done((username !== 'admin' && username !== 'yassine') ? new Error('Must be admin') : undefined)
        }
    },async (request, reply) => {
        const customerHeader = request.headers['h-Custom']

        const user = await findByCredentials(request.query)
        console.log(user);

        return 'logged in!'
    })
}

export default auth;
