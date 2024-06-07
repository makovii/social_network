import { Injectable } from '@nestjs/common';
import { User, UserCreationI } from './user/user.model';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
import * as Neode from 'neode';
import { Entity, Relation, setupSchemas } from './neo4js.schemas';
import { Publication, PublicationCreateI } from './publication/publication.model';
import { CommentPub } from './publication/dto/commentPub.dto';
dotenv.config()
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class Neo4jService {
    private readonly instance;

    constructor(private readonly logger: PinoLogger) {
        this.instance = new Neode(
            env.get('NEO4J_URI').required().asString(),
            env.get('NEO4J_DB').required().asString(),
            env.get('NEO4J_PASSWORD').required().asString(),
        );

        setupSchemas(this.instance);
    }

    async findUserByGoogleId(googleId: string): Promise<User | null> {
        try {
            const result = await this.instance.first(Entity.User, { googleId: googleId });
            return this.userMap(result);
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    async createUser(user: UserCreationI): Promise<User> {
        try {
            const result: Neode.Node<Entity.User> = await this.instance.create(Entity.User, {
                email: user.email,
                password: user.password ?? null,
                googleId: user.googleId ?? null,
            });

            return this.userMap(result);
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw e;
        }
    }

    async getUserByUuid(uuid: string): Promise<User> {
        try {
            const result = await this.instance.find(Entity.User, uuid);
            return this.userMap(result);
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.instance.first(Entity.User, { email: email });
            if (result === false ) return null;
            const result2 = this.userMap(result);
            return result2;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw e;
        }
    }

    async searchUsersByEmail(email: string): Promise<User[]> {
        try {
            const result = await this.instance.cypher(`match (u) where toLower(u.email) contains toLower($email) return u;`, {email})
            const users = result.records
            .map(user => {
                const properties = user.get('u').properties;
                return new User({ ...properties, password: null })
            });

            return users;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
        }
    }

    async createFollow(user: User, userToFollow: User): Promise<boolean> {
        try {
            const userNode = await this.instance.find(Entity.User, user.uuid);
            const userToFollowNode = await this.instance.find(Entity.User, userToFollow.uuid);

            const relation = await userNode.relateTo(userToFollowNode, Relation.FRIEND_TO, { time: Date.now() });
            return true
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            return false
        }
    }

    async unsubscribe(user: User, userToUnsubscribe: User): Promise<boolean> {
        try {
            const userNode = await this.instance.find(Entity.User, user.uuid);
            const userToUnsubscribeNode = await this.instance.find(Entity.User, userToUnsubscribe.uuid);

            const result = await userNode.detachFrom(userToUnsubscribeNode);
            console.log('result: ', result);
            return true
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            return false
        }
    }

    async createPublication(user: User, publication: PublicationCreateI): Promise<Publication> {
        try {
            const userNode = await this.instance.find(Entity.User, user.uuid);

            const resultPub: Neode.Node<Entity.Publication> = await this.instance.create(Entity.Publication, {
                text: publication.text,
            });

            await userNode.relateTo(resultPub, Relation.CREATED, { time: Date.now() });

            return new Publication(resultPub.properties() as unknown as Publication);
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw e;
        }
    }

    async likePub(user: User, uuidPub: String): Promise<boolean> {
        try {
            const userNode = await this.instance.find(Entity.User, user.uuid);
            const pubNode = await this.instance.find(Entity.Publication, uuidPub);

            await userNode.relateTo(pubNode, Relation.LIKED, { time: Date.now() });
            return true;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    async unlikePub(user: User, uuidPub: String): Promise<boolean> {
        const session = this.instance.writeSession();
        try {
            const result = await session.writeTransaction(async tx => {
                const userNode = await this.instance.find(Entity.User, user.uuid, tx);
                const pubNode = await this.instance.find(Entity.Publication, uuidPub, tx);
          
                if (!userNode || !pubNode) {
                  throw new Error('User or Publication not found');
                }
          
                const rel = await this.instance.cypher(
                    `MATCH (u:User {uuid: $userUuid})-[r:LIKED]->(p:Publication {uuid: $pubUuid})
                    DELETE r
                    RETURN u, p`,
                    { userUuid: user.uuid, pubUuid: uuidPub },
                    tx
                );
          
                return rel.records.length > 0;
              });

            return true;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    async commentPub(user: User, pub: CommentPub) {
        try {
            const userNode = await this.instance.find(Entity.User, user.uuid);
            const pubNode = await this.instance.find(Entity.Publication, pub.uuid);

            await userNode.relateTo(pubNode, Relation.COMMENTED, { text: pub.text, time: Date.now() });
            return true;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    async getNews(user: User): Promise<{ publication: Publication, creator: User }[]> {
        try {
            const publicationsNodes = await this.instance.cypher(
                `MATCH (u:User {uuid: $uuid})-[:FOLLOW_TO]->(c:User)-[:CREATED]->(p:Publication)
                 OPTIONAL MATCH (u)-[r:LIKED]->(p)
                 RETURN c, p, r IS NOT NULL as liked`, 
                { uuid: user.uuid }
              );

            const publications = publicationsNodes.records
            .map(record => {
                const publication = record.get('p').properties;
                const creator = record.get('c').properties;
                const liked = record.get('liked');
                return {
                    publication: new Publication({ ...publication, time: new Date(publication.time), isLiked: liked }),
                    user: new User({ ...creator, password: null }),
                }
            });
            return publications;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw e;
        }
    }

    async getSubscriptions(user: User): Promise<User[]> {
        try {
            const userNodes = await this.instance.cypher("MATCH (:User {uuid: $uuid})-[:FOLLOW_TO]->(u:User) RETURN u", {uuid: user.uuid});

            const users = userNodes.records
            .map(userNode => {
                const properties = userNode.get('u').properties;
                return new User({ ...properties, password: null })
            });
            return users;
        } catch (e) {
            console.log(e);
            this.logger.error(e);
            throw (e);
        }
    }

    private userMap(node: Neode.Node<Entity.User>): User {
        return new User({
            email: node.get('email'),
            googleId: node.get('googleId'),
            password: node.get('password'),
            uuid: node.get('uuid'),
        });
    }
}
