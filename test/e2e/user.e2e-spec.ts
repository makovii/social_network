import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let userService = {
        getUserByEmail: jest.fn(),
        searchUsersByEmail: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        createPublication: jest.fn(),
        getNews: jest.fn(),
        getSubscriptions: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: userService },
            ],
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({
            canActivate: (context) => {
                const request = context.switchToHttp().getRequest();
                request.user = { googleId: 'testGoogleId', email: 'test@example.com', uuid: 'testUuid' };
                return true;
            },
        })
        .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/user/getUserByEmail (POST)', () => {
        it('should return a user by email', () => {
            const user = { email: 'test@example.com' };
            userService.getUserByEmail.mockResolvedValue(user);

            return request(app.getHttpServer())
                .post('/user/getUserByEmail')
                .send({ email: 'test@example.com' })
                .expect(201)
                .expect(user);
        });
    });

    describe('/user/searchUsersByEmail (POST)', () => {
        it('should return users matching the email search', () => {
            const users = [{ email: 'test@example.com' }];
            userService.searchUsersByEmail.mockResolvedValue(users);

            return request(app.getHttpServer())
                .post('/user/searchUsersByEmail')
                .send({ email: 'test' })
                .expect(201)
                .expect(users);
        });
    });

    describe('/user/subscribe (POST)', () => {
        it('should subscribe a user to another user', () => {
            userService.subscribe.mockResolvedValue(true);

            return request(app.getHttpServer())
                .post('/user/subscribe')
                .send({ email: 'follow@example.com' })
                .expect(200);
        });

        it('should return 400 if subscription fails', () => {
            userService.subscribe.mockResolvedValue(false);

            return request(app.getHttpServer())
                .post('/user/subscribe')
                .send({ email: 'follow@example.com' })
                .expect(400);
        });
    });

    describe('/user/unsubscribe (POST)', () => {
        it('should unsubscribe a user from another user', () => {
            userService.unsubscribe.mockResolvedValue(true);

            return request(app.getHttpServer())
                .post('/user/unsubscribe')
                .send({ email: 'follow@example.com' })
                .expect(200);
        });

        it('should return 400 if unsubscription fails', async () => {
            userService.unsubscribe.mockResolvedValue(false);

            const response = await request(app.getHttpServer())
                .post('/user/unsubscribe')
                .send({ email: 'follow@example.com' })

            expect(response.status).toBe(400);
        });
    });

    describe('/user/createPublication (POST)', () => {
        it('should create a publication', async () => {
            const publication = { text: 'New Publication' };
            userService.createPublication.mockResolvedValue(publication);
    
            const response = await request(app.getHttpServer())
                .post('/user/createPublication')
                .send({ text: 'New Publication' });
    
            expect(response.status).toBe(201);
            expect(response.body).toEqual(publication);
        });
    });

});
