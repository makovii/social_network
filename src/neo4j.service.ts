import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { User } from './user/user.model';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
import { Relations } from './constant/constant';
dotenv.config()

@Injectable()
export class Neo4jService {
  private readonly driver;

    constructor() {
        this.driver = neo4j.driver(
            env.get('NEO4J_URI').required().asString(),
            neo4j.auth.basic(
                env.get('NEO4J_DB').required().asString(),
                env.get('NEO4J_PASSWORD').required().asString()
            )
        );
    }

    getDriver() {
        return this.driver;
    }

    async close() {
        await this.driver.close();
    }

    async findUserByGoogleId(googleId: string): Promise<User | null> {
        const session = this.driver.session();
        try {
            const result = await session.run('MATCH (u:User {googleId: $googleId}) RETURN u', { googleId });
            if (result.records.length === 0) {
                return null;
            }
            const record = result.records[0];
            return this.mapUserFromRecord(record);
        } finally {
            session.close();
        }
    }

    async createUser(user: User): Promise<User> {
        const session = this.driver.session();
        try {
            const result = await session.run('CREATE (u:User {googleId: $googleId, email: $email, password: $password}) RETURN u, ID(u) as nodeId', user);
            const record = result.records[0];
            return this.mapUserFromRecord(record);
        } finally {
            session.close();
        }
    }

    async getUserById(id: number): Promise<User> {
        const session = this.driver.session();
        try {
            const result = await session.run("MATCH (u:User) WHERE ID(u) = $id RETURN u, ID(u) as nodeId", { id });
            
            if (result.records.length === 0) {
                return null;
            }
            
            const userNode = result.records[0];
            const user = this.mapUserFromRecord(userNode);
            
            return user;
        } finally {
            session.close();
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        const session = this.driver.session();
        try {
            const result = await session.run('MATCH (u:User {email: $email}) RETURN u, ID(u) as nodeId', { email });
            
            if (result.records.length === 0) {
                return null;
            }
            
            const userNode = result.records[0];
            const user = this.mapUserFromRecord(userNode);

            return user;
        } finally {
            session.close();
        }
    }

    async createFollow(requestingUser: User, userToFollow: User): Promise<boolean> {
        const session = this.driver.session();
        try {

            const findQuery = `MATCH p=(u1:User)-[:${Relations.FOLLOW}]->(u2:User) WHERE ID(u1) = $userId1 AND ID(u2) = $userId2 RETURN p`;
            const resultFind = await session.run(findQuery, { userId1: requestingUser.id, userId2: userToFollow.id });

            if (resultFind.records.length !== 0) {
                return true;
            }

            const createQuery = `MATCH (u1:User), (u2:User) WHERE ID(u1) = $userId1 AND ID(u2) = $userId2 CREATE (u1)-[r:${Relations.FOLLOW}]->(u2) RETURN r`;
            const result = await session.run(createQuery, { userId1: requestingUser.id, userId2: userToFollow.id });
            
            if (result.records.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            // TODO: add logger
            console.log(error);
            
            return false;
        } finally {
            session.close();
        }

    }

    private mapUserFromRecord(record): User {
        const node = record.get('u');
        const nodeId = record.get('nodeId').low;

        return new User({
            googleId: node.properties.googleId,
            email: node.properties.email,
            password: node.properties.password,
            // elementId: node.elementId,
            id: nodeId,
        });
    }


}
