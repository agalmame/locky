import { PrismaClient, User } from "@prisma/client";
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()


export const createUser = async (name: string, password: string, email: string) => {
    const crypedPassword = await bcrypt.hash(password, 8)
    const user: User = await prisma.user.create({
        data: {
            name,
            password: crypedPassword,
            email,
            token: 'Empty'
        }
    })
    
    return user
}