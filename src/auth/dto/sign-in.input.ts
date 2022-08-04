import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
