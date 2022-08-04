import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserInput {
  @Length(2, 64)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'password must have at least 1 upper case letter, 1 lower case letter, 1 number or special character, at least 8 characters and at most 128 characters',
  })
  password: string;
}
