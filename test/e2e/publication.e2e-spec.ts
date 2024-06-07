import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PublicationController } from '../../src/publication/publication.controller';
import { PublicationService } from '../../src/publication/publication.service';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { CommentPub } from '../../src/publication/dto/commentPub.dto';


describe('PublicationController (e2e)', () => {
    let app: INestApplication;
    let publicationService = {
        likePub: jest.fn(),
        unlikePub: jest.fn(),
        commentPublication: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [PublicationController],
            providers: [
                { provide: PublicationService, useValue: publicationService },
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

    describe('/publication/likePub (POST)', () => {
        it('should like a publication', async () => {
            publicationService.likePub.mockResolvedValue(true);

            const response = await request(app.getHttpServer())
                .post('/publication/likePub')
                .send({ uuid: '550e8400-e29b-41d4-a716-446655440000' });

            expect(response.status).toBe(200);
        });

        it('should return 400 if liking the publication fails', async () => {
            publicationService.likePub.mockResolvedValue(false);

            const response = await request(app.getHttpServer())
                .post('/publication/likePub')
                .send({ uuid: '550e8400-e29b-41d4-a716-446655440000' });

            expect(response.status).toBe(400);
        });
    });

    describe('/publication/unlikePub (POST)', () => {
        it('should unlike a publication', async () => {
            publicationService.unlikePub.mockResolvedValue(true);

            const response = await request(app.getHttpServer())
                .post('/publication/unlikePub')
                .send({ uuid: '550e8400-e29b-41d4-a716-446655440000' });

            expect(response.status).toBe(200);
        });

        it('should return 400 if unliking the publication fails', async () => {
            publicationService.unlikePub.mockResolvedValue(false);

            const response = await request(app.getHttpServer())
                .post('/publication/unlikePub')
                .send({ uuid: '550e8400-e29b-41d4-a716-446655440000' });

            expect(response.status).toBe(400);
        });
    });

    describe('/publication/commentPub (POST)', () => {
        it('should comment on a publication', async () => {
            publicationService.commentPublication.mockResolvedValue(true);

            const commentData: CommentPub = { text: 'Great post!', uuid: '550e8400-e29b-41d4-a716-446655440000' };

            const response = await request(app.getHttpServer())
                .post('/publication/commentPub')
                .send(commentData);

            expect(response.status).toBe(200);
        });

        it('should return 400 if commenting on the publication fails', async () => {
            publicationService.commentPublication.mockResolvedValue(false);

            const commentData: CommentPub = { text: 'Great post!', uuid: '550e8400-e29b-41d4-a716-446655440000' };

            const response = await request(app.getHttpServer())
                .post('/publication/commentPub')
                .send(commentData);

            expect(response.status).toBe(400);
        });
    });
});
