import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyTypeProvider, FastifyTypeProviderDefault, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerBase, RawServerDefault } from "fastify";
import { FastifyReply } from "fastify";
import fs from 'fs';
import  util from 'util';
import { pipeline } from 'stream';
import path from "path";

const pump = util.promisify(pipeline);



type MyPluginInstance = FastifyInstance & {verifyToken: (request: Record<string, any>, reply: FastifyReply, done: Function)=> Promise<void> } & {baseDir: string};

const file  = async (fastify: MyPluginInstance , _opts: FastifyPluginOptions): Promise<void> => {
    fastify.register(require('@fastify/auth'))
    fastify.get('/', {
        preHandler: fastify.auth([fastify.verifyToken]),
    }, async (request: Record<string, any> , reply: FastifyReply)=>{
        reply.send({file:'file', user: request.user})
    })

    fastify.post('/', {
        preHandler: fastify.auth([fastify.verifyToken]),
    }, async (req: Record<string, any>, reply) => {

        const data = await req.file()
        data.file // stream
        data.fields // other parsed parts
        data.fieldname
        data.filename
        data.encoding
        data.mimetype
        await pump(data.file, fs.createWriteStream(path.join(fastify.baseDir,'/public/', data.filename)))
      
        reply.send()
    })
}

export {file};
export default file;