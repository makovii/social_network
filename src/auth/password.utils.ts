import * as bcrypt from 'bcrypt';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
dotenv.config()

async function hashPassword(password: string): Promise<string> {
    const saltRounds = env.get('SALT').required().asInt();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}



export { hashPassword };
