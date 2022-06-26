import fastify , {FastifyInstance, FastifyRequest} from 'fastify'
import { PrismaClient, User } from '@prisma/client'
import  bcrypt from 'bcryptjs';
import 'dotenv/config'
import { findByToken , generateToken, findByCredentials} from './services/authService';
import { IHeaders, IQuerystring } from './types/general'; 

const prisma = new PrismaClient()
const server: FastifyInstance = fastify()



prisma.$use(async (params, next) => {
	if (params.model == 'User' && params.action == 'create') {
		let { password } = params.args.data

		params.args.data.password = await bcrypt.hash(password, 8);
	}
	return next(params)
})


server.get('/ping', async (request, reply) => {
	const user : User | null= await prisma.user.findUnique({
		where: {
		  id: 1
		}
	})
	if (user) {
		const token  = await generateToken(user as User)
		return {token}
	}

  return 'pong\n'
})

server.get<{
	Querystring: IQuerystring,
	Headers: IHeaders,
}>('/auth', {
	preValidation: (request: FastifyRequest<{
		Querystring: IQuerystring,
		Headers: IHeaders
	}>, reply, done) => {
		const { username, password } = request.query
		done(username !== 'admin' ? new Error('Must be admin') : undefined)
	}
},async (request, reply) => {
	const customerHeader = request.headers['h-Custom']
	const {password , username} = request.query
	// const allUsers: User = await prisma.user.create({
	// 	data: {
	// 		name : request.query.username,
	// 		password: request.query.password,
	// 		email : request.query.username + '@gmail.com',
	// 		token: 'Empty'
	// 	}
	// })

	const user = await findByCredentials(request.query)
	console.log(user);
	await prisma.$disconnect()

	return 'logged in!'
})

server.listen(8083, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
