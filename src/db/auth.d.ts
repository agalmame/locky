import 'dotenv/config';
import { User } from '@prisma/client';
interface TokenInterface {
    email: string | null;
    name: string | null;
    id: string;
}
export default TokenInterface;
export declare const generateToken: (user: User) => Promise<string>;
