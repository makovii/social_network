import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Neo4jService } from '../neo4j.service';
import { User } from '../user/user.model';
import { CommentPub } from './dto/commentPub.dto';

@Injectable()
export class PublicationService {
    constructor(private readonly neo4jService: Neo4jService) {}

    async likePub(user: User, uuidPub: string): Promise<boolean> {
        const pubRelationExist = await this.neo4jService.likePub(user, uuidPub);
        if (!pubRelationExist) throw new InternalServerErrorException();

        return pubRelationExist;
    }

    async unlikePub(user: User, uuidPub: string): Promise<boolean> {
        const pubRelationExist = await this.neo4jService.unlikePub(user, uuidPub);
        if (!pubRelationExist) throw new InternalServerErrorException();

        return pubRelationExist;
    }

    async commentPublication(user: User, pub: CommentPub) {
        const pubCommented = await this.neo4jService.commentPub(user, pub);
        if (!pubCommented) throw new InternalServerErrorException();

        return pubCommented;
    }
}
