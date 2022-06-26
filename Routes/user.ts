import fastify, { FastifyInstance, FastifyRequest } from "fastify"
import { findByToken } from "../services/authService";
import { IHeaders, IQuerystring } from "../types/general"
// import  fastifyAuth from "fastify-auth"


type requestType = {
	Querystring: IQuerystring
}
type decoratorType  = (this:requestType, request: requestType, reply: any) => any

function async (fastify: FastifyInstance, opts: any): void {

    fastify.decorate<decoratorType>('asyncVerifyJWT', async function (this:requestType,request,reply): void  {
        try {
            const name = this.query.username
            const {username, password} = request.headers;
            if (!request.headers.authorization) {
                throw new Error('No token was sent');
            }
            const token: string = request.headers.authorization.replace('Bearer ', '');
            const user = await findByToken(token);
            if (!user) {
                throw new Error('Authentication failed!');
            }
            request.user = user;
            request.token = token; 
        } catch (error) {
            reply.code(401).send(error);
        }

    })
}