import { Node, Integer } from 'neo4j-driver';

export interface UserCreationInterface {
    email: string;
    googleId: string;
    password: string;
}

export class User implements Node {
    identity: Integer;
    elementId: string;
    labels: string[];
    properties: any;
    email: string;
    password: string;
    googleId: string;

    constructor(options: {email: string, googleId: string; password: string}) {
        this.email = options.email;
        this.googleId = options.googleId;
        this.password = options.password;
    }
}
