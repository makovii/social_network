export interface UserCreationI {
    email: string;
    googleId?: string;
    password: string;
}

export class User {
    uuid: string;
    email: string;
    password: string;
    googleId: string;

    constructor(options: {email?: string, googleId?: string; password?: string, uuid?: string}) {
        this.email = options.email;
        this.googleId = options.googleId;
        this.password = options.password;
        this.uuid = options.uuid;
    }
}
