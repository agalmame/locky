"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jwtSecret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : '';
const generateToken = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = jsonwebtoken_1.default.sign({ id: user.id.toString() }, jwtSecret, { expiresIn: '1h' });
        prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                token
            }
        });
        return token;
    });
};
exports.generateToken = generateToken;
const findByToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        let decoded;
        try {
            if (!token) {
                throw new Error('Missing token header');
            }
            decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        }
        catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error)
                message = error.message;
            return message;
        }
        return yield prisma.user.findUnique({
            where: {
                id: parseInt(decoded.id),
            }
        });
    });
};
exports.findByToken = findByToken;
// export const findByCredentials = async (username, password) => {
//     const user = await User.findOne({ username });
//     if (!user) {
//         throw new Error('Unable to login. Wrong username!');
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//         throw new Error('Unable to login. Wrong Password!');
//     }
//     return user;
// };
