import { BadRequestException, Injectable } from '@nestjs/common';
import { Neo4jService } from '../neo4j.service';
import { User, UserCreationI } from '../user/user.model';
import * as bcrypt from 'bcrypt';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
dotenv.config()
import { JwtService } from '@nestjs/jwt';
import { ErrorText } from '../constant/constant';


@Injectable()
export class AuthService {
    constructor(
        private readonly neo4jService: Neo4jService,
        private jwtService: JwtService,
    ) {}
    
    async hashPassword(password: string): Promise<string> {
        const salt = env.get('SALT').required().asInt();
        const hashedPass = await bcrypt.hash(password, salt);
        return hashedPass;
    }

    async register(body: { email: string, password: string }){
        try {
            const userExist = await this.neo4jService.getUserByEmail(body.email);
            if (userExist) {
                throw new BadRequestException(ErrorText.EMAIL_ALREADY_REGISTERED);
            }

            const hashedPass = await this.hashPassword(body.password);

            const userObject: UserCreationI = { email: body.email, password: hashedPass };
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
          throw new BadRequestException(ErrorText.INVALID_CREDENTIALS);
        }
    
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new BadRequestException(ErrorText.INVALID_CREDENTIALS);
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
        const payload = {
            email: user.email,
            uuid: user.uuid,
            googleId: user.googleId,
        };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
