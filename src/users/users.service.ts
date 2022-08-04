import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const escape = require('lodash.escape');

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | never> {
    this.logger.log(`Fetching user with email [${email}]...`);

    const foundUser = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (!foundUser) {
      this.logger.error(`User with email [${email}] not found!`);
      throw new NotFoundException();
    }

    this.logger.log('User found, returning it...');

    return foundUser;
  }

  async findByExternalId(externalId: string): Promise<User | never> {
    this.logger.log(`Fetching user with externalId [${externalId}]...`);

    const foundUser = await this.usersRepository.findOne({
      where: {
        externalId,
      },
    });

    if (!foundUser) {
      this.logger.error(`User with externalId [${externalId}] not found!`);
      throw new NotFoundException();
    }

    this.logger.log('User found, returning it...');

    return foundUser;
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    createUserInput.name = escape(createUserInput.name);
    createUserInput.email = escape(createUserInput.email);
    createUserInput.username = escape(createUserInput.username);

    return this.usersRepository.save(this.usersRepository.create(createUserInput));
  }

  async update(externalId: string, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findByExternalId(externalId);

    Object.assign(user, updateUserInput);

    return this.usersRepository.save(user);
  }
}
