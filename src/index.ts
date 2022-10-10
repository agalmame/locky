import fastify , {FastifyInstance, FastifyReply} from 'fastify'
import 'dotenv/config'
import closeWithGrace from 'close-with-grace'
import { AuthService } from './services/auth/authService';
import { findUserById } from './db/user';
import { ServerResponse } from 'http';


const isProduction = process.env.NODE_ENV === "production";
const server: FastifyInstance = fastify({
	logger: !isProduction
})

server.register(import('./app'));

const closeListeners = closeWithGrace({ delay: 500}, async (opts: any) => {
	if (opts.err) {
		server.log.error(opts.err)
	}
	await server.close()
})

const verifyToken = async (request: Record<string, any>, reply: FastifyReply, done: Function) => {
    const {token} = request.headers;

    const id = await new AuthService().verifyAccessToken(token as string);

    if (!id) {
        done(new Error('Unauthorized'));
    }
    request.user = await findUserById(id);
    done();
}
server.decorate('verifyToken', verifyToken);
server.decorate('baseDir', __dirname);

server.addHook('onClose', async (_instance, done) => {
	closeListeners.uninstall();
	done();
})
server.listen({ port: 8083, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`Server listening at ${address}`)
})
