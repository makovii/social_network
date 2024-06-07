import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Neo4jService } from '../neo4j.service';
import { userMapper } from './user.mapper';
import { Publication, PublicationCreateI } from '../publication/publication.model';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
    constructor(private readonly neo4jService: Neo4jService, private readonly logger: PinoLogger) {
        this.logger.setContext(UserService.name);
    }

    async getUserByUuid(uuid: string): Promise<User | null> {
        const user = await this.neo4jService.getUserByUuid(uuid);
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.neo4jService.getUserByEmail(email);
        if (!user) throw new BadRequestException(`There is no user with email: ${email}`);
        this.logger.info(`get user ${email}`);
        return userMapper(user);
    }

    async searchUsersByEmail(email: string) {
        const users = await this.neo4jService.searchUsersByEmail(email);
        return users.map(user => userMapper(user));
    }

    async subscribe(requestingUser: User, emailToFollow: string): Promise<boolean> {
        const userToFollow = await this.neo4jService.getUserByEmail(emailToFollow);

        if (!userToFollow) throw new BadRequestException(`There is no user with email - ${emailToFollow}`);
        this.logger.info(`subscribe ${requestingUser.email} to ${emailToFollow}`);
        return await this.neo4jService.createFollow(requestingUser, userToFollow);
    }

    async unsubscribe(requestingUser: User, emailToFollow: string): Promise<boolean> {
        const userToFollow = await this.neo4jService.getUserByEmail(emailToFollow);

        if (!userToFollow) throw new BadRequestException(`There is no user with email - ${emailToFollow}`);

        return await this.neo4jService.unsubscribe(requestingUser, userToFollow);
    }

    async createPublication(user: User, text: string): Promise<Publication> {
        const userExist = await this.neo4jService.getUserByEmail(user.email);

        if (!userExist) throw new BadRequestException(`There is no user with email - ${user.email}`);

        const publication: PublicationCreateI = { text };

        return await this.neo4jService.createPublication(user, publication);
    }

    async getNews(user: User): Promise<{publication: Publication; creator: User;}[]> {
        return await this.neo4jService.getNews(user);
    }

    async getSubscriptions(user: User): Promise<User[]> {
        return await this.neo4jService.getSubscriptions(user);
    }
}
