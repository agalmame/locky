import { User } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import { createUser } from "../../db/user";

interface IUserRoute {
    Body: { name:string; password:string; email: string;},
    Header:{'h-Custom': string}
}
const user : FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
    fastify.post<IUserRoute>('/', {}, async (request, reply) => {
        const user: User = await createUser(request.body.name, request.body.password, request.body.email);
        return user;
    });
}

export default user;