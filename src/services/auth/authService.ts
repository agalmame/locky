import { User } from "@prisma/client";
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import util from 'util'

dotenv.config()

export


class AuthService {


    public async generateAccessToken(user: User): Promise<string | undefined>{

        return new Promise((resolve, reject) => {
            jwt.sign(
                    {id: user.id}, 
                    process.env.JWT_SECRET as string, 
                    { expiresIn: process.env.TOKEN_EXPIRATION, audience: process.env.APP_URL, issuer: process.env.APP_URL},
                    (err, token) => {
                        if (err) return reject(err);
                        else return resolve(token);
                });
            });          
    }
}