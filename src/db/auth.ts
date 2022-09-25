import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { PrismaClient, User } from '@prisma/client'
import { IQuerystring } from '../types/general'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type JWT_SECRET  = string 
const jwtSecret : JWT_SECRET = process.env.JWT_SECRET ?? ''

interface TokenInterface {
    email: string | null;
    name: string | null;
    id: string;
  }

export default TokenInterface;

prisma.$use(async (params, next) => {
	if (params.model == 'User' && params.action == 'create') {
		let { password } = params.args.data

		params.args.data.password = await bcrypt.hash(password, 8);
	}
	return next(params)
})

export const generateToken = async function(user: User): Promise<string> {
    const token : string = jwt.sign({ id: user.id.toString() }, jwtSecret, { expiresIn: '1h' });
    prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            token
        }
    })

    return token;
}

export const findByToken = async function( token: string): Promise<User | null| string>  {
    let decoded;
    try {
        if (!token) {
            throw new Error('Missing token header');
        }
        decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
        let message = 'Unknown Error'
        if (error instanceof Error) message = error.message
        return message;
    }
    return await prisma.user.findUnique({
        where: {
        id: parseInt((decoded as TokenInterface).id),
    }});
};

export const findByCredentials = async (arg : IQuerystring) : Promise<User|Error> => {
    const user = await prisma.user.findFirst({ where: { name: arg.username  } });
    if (!user) {
        throw new Error('Unable to login. Wrong username!');
    }
    const isMatch = await bcrypt.compare(arg.password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login. Wrong Password!');
    }
    await prisma.$disconnect()
    return user;
};