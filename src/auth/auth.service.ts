import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { Builder } from 'builder-pattern';

import { CreateUserInput } from '../users/dto/create-user.input';
import { DatabaseErrorCode } from '../users/enums/database-error-codes.enum';
import { JwtPayload } from './dto/jwt-payload.output';
import { SignInInput } from './dto/sign-in.input';
import { SignInOutput } from './dto/sign-in.output';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInInput: SignInInput): Promise<SignInOutput | never> {
    this.logger.log('Validating user credentials...');

    const user = await this.usersService.findByEmail(signInInput.email);
    const passwordMatches = bcrypt.compareSync(signInInput.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }

    this.logger.log('Credentials successfully validated! Creating token...');

    const payload = Builder(JwtPayload)
      .sub(user.externalId)
      .name(user.name)
      .email(user.email)
      .username(user.username)
      .avatarUrl(user.avatarUrl)
      .build();

    const token = this.jwtService.sign(instanceToPlain(payload));

    return {
      token,
    };
  }

  public async signUp(createUserInput: CreateUserInput): Promise<void | never> {
    try {
      this.logger.log('Registering new user...');

      await this.usersService.create(createUserInput);

      this.logger.log('User successfully registered!');
    } catch (err) {
      if (err.code === DatabaseErrorCode.UniqueViolation) {
        this.logger.error('E-mail address already in use!');
        throw new ConflictException('E-mail address already in use!');
      }

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async validateUser(payload: JwtPayload): Promise<User | never> {
    this.logger.debug('Validating current user...');

    return this.usersService.findByEmail(payload.email).catch(() => {
      this.logger.error(`Invalid user detected! Token payload: [${JSON.stringify(payload)}]`);

      throw new UnauthorizedException();
    });
  }
}
