import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Neo4jService } from '../neo4j.service';
import { User } from '../user/user.model';
import { hashPassword } from './password.utils';

@Injectable()
export class AuthService {
    constructor(private readonly neo4jService: Neo4jService,) {}
    
    async register(body: { email: string, password: string }){
        try {
            const existingUser = await this.neo4jService.getUserByEmail(body.email);
            if (existingUser) {
                throw new BadRequestException('Email is already registered');
            }

            const hashedPassword = await hashPassword(body.password);

            const userObject = new User({ email: body.email, password: hashedPassword, googleId: '' });
            const newUser = await this.neo4jService.createUser(userObject);

            return newUser;
        } catch (error) {
            // TODO: add logger

            console.log(error);
            throw error;
        }
    }
}
