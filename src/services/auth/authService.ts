import { User } from "@prisma/client";
import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import util from 'util'
import { findUserById } from "../../db/user";

dotenv.config()

export


class AuthService {

    public async generateAccessToken(user: User): Promise<string>{

        return new Promise((resolve, reject) => {
            jwt.sign(
                    {id: user.id}, 
                    process.env.JWT_SECRET as string, 
                    { expiresIn: process.env.TOKEN_EXPIRATION, audience: process.env.APP_URL, issuer: process.env.APP_URL},
                    (err, token) => {
                        token = token as string
                        if (err) return reject(err);
                        else return resolve(token);
                });
            });          
    }

    public async verifyAccessToken(token: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET as string,(err, decoded) => {
                const decode: any = decoded as any
                if (err) {
                    return reject({err})
                }
                if (!decode?.id) {
                    return reject({err: 'No id found'})
                }
                return resolve(parseInt(decode.id))
               
            })
        });
    } 
}