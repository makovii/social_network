export interface PublicationCreateI {
    text: string;
}

export class Publication {
    uuid: string;
    properties: any;
    text: string;
    time: Date;
    isLiked?: boolean;

    constructor(options: { text: string, uuid?: string, time?: Date, isLiked?: boolean }) {
        this.text = options.text;
        this.uuid = options.uuid;
        this.time = options.time;
        this.isLiked = options.isLiked;
    }
}
