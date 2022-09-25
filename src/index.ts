import fastify , {FastifyInstance} from 'fastify'
import 'dotenv/config'
import closeWithGrace from 'close-with-grace'


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
