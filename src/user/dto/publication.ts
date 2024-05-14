import { Node, Integer } from 'neo4j-driver';

export interface PublicationCreateInterface {
    text: string;
}

export class Publication implements Node {
    id: string;
    identity: Integer;
    elementId: string;
    labels: string[];
    properties: any;
    text: string;

    constructor(options: { text: string, id?: string }) {
        this.text = options.text;
        this.id = options.id;
    }
}
