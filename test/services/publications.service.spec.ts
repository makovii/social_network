import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { PublicationService } from '../../src/publication/publication.service';
import { Neo4jService } from '../../src/neo4j.service';
import { User } from '../../src/user/user.model';
import { CommentPub } from '../../src/publication/dto/commentPub.dto';

describe('PublicationService', () => {
    let publicationService: PublicationService;
    let neo4jService: Partial<Neo4jService>;

    beforeEach(async () => {
        neo4jService = {
            likePub: jest.fn(),
            unlikePub: jest.fn(),
            commentPub: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PublicationService,
                { provide: Neo4jService, useValue: neo4jService },
            ],
        }).compile();

        publicationService = module.get<PublicationService>(PublicationService);
    });

    it('should be defined', () => {
        expect(publicationService).toBeDefined();
    });

    describe('likePub', () => {
        it('should like a publication', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const uuidPub = 'pub1';
            (neo4jService.likePub as jest.Mock).mockResolvedValue(true);

            const result = await publicationService.likePub(user, uuidPub);
            expect(result).toBe(true);
        });

        it('should throw InternalServerErrorException if likePub fails', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const uuidPub = 'pub1';
            (neo4jService.likePub as jest.Mock).mockResolvedValue(false);

            await expect(publicationService.likePub(user, uuidPub)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('unlikePub', () => {
        it('should unlike a publication', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const uuidPub = 'pub1';
            (neo4jService.unlikePub as jest.Mock).mockResolvedValue(true);

            const result = await publicationService.unlikePub(user, uuidPub);
            expect(result).toBe(true);
        });

        it('should throw InternalServerErrorException if unlikePub fails', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const uuidPub = 'pub1';
            (neo4jService.unlikePub as jest.Mock).mockResolvedValue(false);

            await expect(publicationService.unlikePub(user, uuidPub)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('commentPublication', () => {
        it('should comment on a publication', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const commentPub: CommentPub = { text: 'Nice post!', uuid: 'pub1' };
            (neo4jService.commentPub as jest.Mock).mockResolvedValue(true);

            const result = await publicationService.commentPublication(user, commentPub);
            expect(result).toBe(true);
        });

        it('should throw InternalServerErrorException if commentPublication fails', async () => {
            const user: User = { uuid: 'uuid1', email: 'test@example.com', password: 'psw', googleId: null };
            const commentPub: CommentPub = { text: 'Nice post!', uuid: 'pub1' };
            (neo4jService.commentPub as jest.Mock).mockResolvedValue(false);

            await expect(publicationService.commentPublication(user, commentPub)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
