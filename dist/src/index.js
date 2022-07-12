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
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv/config");
const authService_1 = require("./services/authService");
const prisma = new client_1.PrismaClient();
const server = (0, fastify_1.default)();
prisma.$use((params, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (params.model == 'User' && params.action == 'create') {
        let { password } = params.args.data;
        params.args.data.password = yield bcryptjs_1.default.hash(password, 8);
    }
    return next(params);
}));
server.get('/ping', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            id: 1
        }
    });
    if (user) {
        const token = yield (0, authService_1.generateToken)(user);
        return { token };
    }
    return 'pong\n';
}));
server.get('/auth', {
    preValidation: (request, reply, done) => {
        const { username, password } = request.query;
        done(username !== 'admin' ? new Error('Must be admin') : undefined);
    }
}, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const customerHeader = request.headers['h-Custom'];
    const { password } = request.query;
    // const allUsers: User = await prisma.user.create({
    // 	data: {
    // 		name : request.query.username,
    // 		password: request.query.password,
    // 		email : request.query.username + '@gmail.com',
    // 		token: 'Empty'
    // 	}
    // })
    const user = yield (0, authService_1.findByToken)(password);
    console.log(user);
    yield prisma.$disconnect();
    return 'logged in!';
}));
server.listen(8083, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
