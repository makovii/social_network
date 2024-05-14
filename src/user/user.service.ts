import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Neo4jService } from '../neo4j.service';
import { userMapper } from './user.mapper';
import { Publication, PublicationCreateInterface } from './dto/publication';

@Injectable()
export class UserService {
    constructor(private readonly neo4jService: Neo4jService) {}

    async getUserById(id: number): Promise<User | null> {
        const user = await this.neo4jService.getUserById(id);
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.neo4jService.getUserByEmail(email);
        return userMapper(user);
    }

    // TODO: move user verification to separate function 
    async follow(requestingUser: User, emailToFollow: string): Promise<boolean> {
        const userToFollow = await this.neo4jService.getUserByEmail(emailToFollow);

        if (!userToFollow) throw new BadRequestException(`There is no user with email - ${emailToFollow}`);

        return await this.neo4jService.createFollow(requestingUser, userToFollow);
    }

    async createPublication(user: User, text: string): Promise<Publication> {
        const userExist = await this.neo4jService.getUserByEmail(user.email);

        if (!userExist) throw new BadRequestException(`There is no user with email - ${user.email}`);

        const publication: PublicationCreateInterface = { text };

        return await this.neo4jService.createPublication(user, publication);
    }
}
