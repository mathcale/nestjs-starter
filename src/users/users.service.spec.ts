import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';

import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const userMock: User = Builder(User)
    .id(1)
    .externalId('mock-user')
    .name('Mock User 1')
    .email('user@mock.com')
    .username('mockuser')
    .build();

  const createUserInput: CreateUserInput = Builder(CreateUserInput)
    .name('Mock User 1')
    .email('user@mock.com')
    .username('mockuser')
    .password('Mock123!')
    .build();

  const usersRepositoryMock = {
    findOne: jest.fn().mockResolvedValue(userMock),
    create: jest.fn().mockResolvedValue(userMock),
    save: jest.fn().mockResolvedValue(userMock),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('user@mock.com');

    expect(user).toBeDefined();
    expect(user).toStrictEqual(userMock);
  });

  it('should throw "not found" error when user with email doesn\'t exists', async () => {
    jest.spyOn(usersRepositoryMock, 'findOne').mockResolvedValue(null);

    await expect(service.findByEmail('ghost@mock.com')).rejects.toThrowError(NotFoundException);
  });

  it('should find user by externalId', async () => {
    jest.spyOn(usersRepositoryMock, 'findOne').mockResolvedValue(userMock);
    const user = await service.findByExternalId('mock-user');

    expect(user).toBeDefined();
    expect(user).toStrictEqual(userMock);
  });

  it('should throw "not found" error when user with externalId doesn\'t exists', async () => {
    jest.spyOn(usersRepositoryMock, 'findOne').mockResolvedValue(null);

    await expect(service.findByExternalId('ghost')).rejects.toThrowError(NotFoundException);
  });

  it('should create new user of type User successfully', async () => {
    const newUser = await service.create(createUserInput);

    expect(newUser).toBeDefined();
    expect(newUser).toStrictEqual(userMock);
  });

  it('show throw error while creating user with bad input', async () => {
    jest.spyOn(usersRepositoryMock, 'save').mockRejectedValue(new Error());

    await expect(service.create({} as CreateUserInput)).rejects.toThrow();
  });
});
