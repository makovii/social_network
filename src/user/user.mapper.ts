import { User } from "./user.model";

export function userMapper(user: User): { email: string } {
    return {
        email: user.email,
    }
}
