import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyReply } from 'fastify';
import { DateTime } from 'luxon';
import {join} from 'path'
import { findToken } from './db';
import { findUserById } from './db/user';
import { AuthService } from './services/auth/authService';


export type AppOptions = {

} & Partial<AutoloadPluginOptions>;

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
const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
    fastify.decorate('verifyToken', verifyToken); 

    void fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: Object.assign({}, opts),
    })
    void fastify.register(AutoLoad, {
        dir: join(__dirname, 'routes'),
        options: opts,
    })
}

export default app;
export {app};


