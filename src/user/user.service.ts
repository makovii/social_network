import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Neo4jService } from '../neo4j.service';

@Injectable()
export class UserService {
    constructor(private readonly neo4jService: Neo4jService) {}

    async getUserById(id: number): Promise<User | null> {
        const user = await this.neo4jService.getUserById(id);
        return user;
    }
}
