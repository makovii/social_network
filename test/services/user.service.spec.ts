import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserService } from '../../src/user/user.service';
import { Neo4jService } from '../../src/neo4j.service';
import { User } from '../../src/user/user.model';
import { userMapper } from '../../src/user/user.mapper';
import { Publication, PublicationCreateI } from '../../src/publication/publication.model';

jest.mock('../../src/user/user.mapper', () => ({
    userMapper: jest.fn(),
}));

describe('UserService', () => {
    let userService: UserService;
    let neo4jService: Partial<Neo4jService>;

    beforeEach(async () => {
        neo4jService = {
            getUserByUuid: jest.fn(),
            getUserByEmail: jest.fn(),
            searchUsersByEmail: jest.fn(),
            createFollow: jest.fn(),
            unsubscribe: jest.fn(),
            createPublication: jest.fn(),
            getNews: jest.fn(),
            getSubscriptions: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: Neo4jService, useValue: neo4jService },
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
    });

    describe('getUserByUuid', () => {
        it('should return a user by uuid', async () => {
            const user: User = {
                uuid: 'uuid1',
                email: 'test@example.com',
                password: 'passwd',
                googleId: null,
            };
            (neo4jService.getUserByUuid as jest.Mock).mockResolvedValue(user);

            const result = await userService.getUserByUuid('uuid1');
            expect(result).toEqual(user);
        });

        it('should return null if user is not found', async () => {
            (neo4jService.getUserByUuid as jest.Mock).mockResolvedValue(null);

            const result = await userService.getUserByUuid('uuid1');
            expect(result).toBeNull();
        });
    });

    describe('getUserByEmail', () => {
        it('should return a mapped user by email', async () => {
            const user = { uuid: 'uuid1', email: 'test@example.com' };
            const mappedUser = { ...user, name: 'Test User' };
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(user);
            (userMapper as jest.Mock).mockReturnValue(mappedUser);

            const result = await userService.getUserByEmail('test@example.com');
            expect(result).toEqual(mappedUser);
        });

        it('should throw BadRequestException if user is not found', async () => {
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            await expect(userService.getUserByEmail('test@example.com')).rejects.toThrow(BadRequestException);
        });
    });

    describe('searchUsersByEmail', () => {
        it('should return mapped users by email search', async () => {
            const users = [{ uuid: 'uuid1', email: 'test@example.com' }];
            const mappedUsers = users.map(user => ({ ...user, name: 'Test User' }));
            (neo4jService.searchUsersByEmail as jest.Mock).mockResolvedValue(users);
            (userMapper as jest.Mock).mockImplementation(user => ({ ...user, name: 'Test User' }));

            const result = await userService.searchUsersByEmail('test@example.com');
            expect(result).toEqual(mappedUsers);
        });
    });

    describe('subscribe', () => {
        it('should create a follow relationship', async () => {
            const requestingUser = { uuid: 'uuid1', email: 'requester@example.com' } as User;
            const userToFollow = { uuid: 'uuid2', email: 'followee@example.com' } as User;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(userToFollow);
            (neo4jService.createFollow as jest.Mock).mockResolvedValue(true);

            const result = await userService.subscribe(requestingUser, 'followee@example.com');
            expect(result).toBe(true);
        });

        it('should throw BadRequestException if user to follow is not found', async () => {
            const requestingUser = { uuid: 'uuid1', email: 'requester@example.com' } as User;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            await expect(userService.subscribe(requestingUser, 'followee@example.com')).rejects.toThrow(BadRequestException);
        });
    });

    describe('unsubscribe', () => {
        it('should remove a follow relationship', async () => {
            const requestingUser = { uuid: 'uuid1', email: 'requester@example.com' } as User;
            const userToFollow = { uuid: 'uuid2', email: 'followee@example.com' } as User;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(userToFollow);
            (neo4jService.unsubscribe as jest.Mock).mockResolvedValue(true);

            const result = await userService.unsubscribe(requestingUser, 'followee@example.com');
            expect(result).toBe(true);
        });

        it('should throw BadRequestException if user to follow is not found', async () => {
            const requestingUser = { uuid: 'uuid1', email: 'requester@example.com' } as User;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            await expect(userService.unsubscribe(requestingUser, 'followee@example.com')).rejects.toThrow(BadRequestException);
        });
    });

    describe('createPublication', () => {
        it('should create a publication', async () => {
            const user = { uuid: 'uuid1', email: 'user@example.com' } as User;
            const publication = { text: 'Test Publication' } as PublicationCreateI;
            const createdPublication = { ...publication, uuid: 'pub1' } as Publication;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(user);
            (neo4jService.createPublication as jest.Mock).mockResolvedValue(createdPublication);

            const result = await userService.createPublication(user, 'Test Publication');
            expect(result).toEqual(createdPublication);
        });

        it('should throw BadRequestException if user does not exist', async () => {
            const user = { uuid: 'uuid1', email: 'user@example.com' } as User;
            (neo4jService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            await expect(userService.createPublication(user, 'Test Publication')).rejects.toThrow(BadRequestException);
        });
    });

    describe('getNews', () => {
        it('should return news', async () => {
            const user = { uuid: 'uuid1', email: 'user@example.com' } as User;
            const news = [{ publication: { text: 'News 1' }, creator: { email: 'creator1@example.com' } } as any];
            (neo4jService.getNews as jest.Mock).mockResolvedValue(news);

            const result = await userService.getNews(user);
            expect(result).toEqual(news);
        });
    });

    describe('getSubscriptions', () => {
        it('should return subscriptions', async () => {
            const user = { uuid: 'uuid1', email: 'user@example.com' } as User;
            const subscriptions = [{ uuid: 'uuid2', email: 'subscribed@example.com' } as User];
            (neo4jService.getSubscriptions as jest.Mock).mockResolvedValue(subscriptions);

            const result = await userService.getSubscriptions(user);
            expect(result).toEqual(subscriptions);
        });
    });
});
