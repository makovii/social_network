import { BadRequestException, Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j.service';
import { User } from '../user/user.model';
import * as bcrypt from 'bcrypt';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
dotenv.config()
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        private readonly neo4jService: Neo4jService,
        private jwtService: JwtService,
    ) {}
    
    async hashPassword(password: string): Promise<string> {
        const saltRounds = env.get('SALT').required().asInt();
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    async register(body: { email: string, password: string }){
        try {
            const existingUser = await this.neo4jService.getUserByEmail(body.email);
            if (existingUser) {
                throw new BadRequestException('Email is already registered');
            }

            const hashedPassword = await this.hashPassword(body.password);

            const userObject = new User({ email: body.email, password: hashedPassword, googleId: '' });
            const newUser = await this.neo4jService.createUser(userObject);

            return newUser;
        } catch (error) {
            // TODO: add logger

            console.log(error);
            throw error;
        }
    }
    
      async login(body: { email: string; password: string }) {
        const { email, password } = body;
        const user = await this.neo4jService.getUserByEmail(email);
        if (!user) {
          throw new BadRequestException('Invalid credentials');
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new BadRequestException('Invalid credentials');
        }
    
        return await this.generateJwtToken(user);
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.neo4jService.getUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    async generateJwtToken(user: User) {
        const payload = { email: user.email };
        console.log('user', user);
        console.log('payload', payload)
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
