import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserByPassDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
