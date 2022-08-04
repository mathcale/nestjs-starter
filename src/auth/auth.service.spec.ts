import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { CreateUserInput } from '../users/dto/create-user.input';
import { DatabaseErrorCode } from '../users/enums/database-error-codes.enum';
import { JwtPayload } from './dto/jwt-payload.output';
import { SignInInput } from './dto/sign-in.input';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const userMock: User = Builder(User)
    .id(1)
    .externalId('mock-user')
    .name('Mock User 1')
    .email('user@mock.com')
    .username('mockuser')
    .build();

  const tokenPayloadMock = Builder(JwtPayload)
    .sub(userMock.externalId)
    .name(userMock.name)
    .email(userMock.email)
    .username(userMock.username)
    .build();

  const signInInput = Builder(SignInInput).email('user@mock.com').password('Mock123!').build();

  const badSignInInput = Builder(SignInInput)
    .email('user@mock.com')
    .password('non-valid-password')
    .build();

  const createUserInput = Builder(CreateUserInput)
    .name('Mock User 1')
    .email('user@mock.com')
    .password('Mock123!')
    .build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('secret'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(userMock),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = await module.get<AuthService>(AuthService);
    usersService = await module.get<UsersService>(UsersService);
  });

  describe('Sign-in', () => {
    it('should find a valid user from decoded token', async () => {
      const findByEmailSpy = jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userMock);
      const user = await authService.validateUser(tokenPayloadMock);

      expect(findByEmailSpy).toBeCalledTimes(1);
      expect(user).toStrictEqual(userMock);
    });

    it("should throw exception if decoded token doesn't contain a valid user", async () => {
      jest.spyOn(usersService, 'findByEmail').mockRejectedValue(new UnauthorizedException());

      await expect(authService.validateUser(tokenPayloadMock)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should sign user in successfully', async () => {
      const findByEmailSpy = jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const signInOutput = await authService.signIn(signInInput);

      expect(findByEmailSpy).toBeCalledTimes(1);
      expect(findByEmailSpy).toBeCalledWith(signInInput.email);
      expect(signInOutput).toBeDefined();
      expect(signInOutput.token.length).toBeGreaterThan(0);
    });

    it('should throw error if provided password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userMock);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authService.signIn(badSignInInput)).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('Sign-up', () => {
    it('should register new user successfully', async () => {
      const createUserMock = jest
        .spyOn(usersService, 'create')
        .mockImplementation(() => Promise.resolve(userMock));

      await authService.signUp(createUserInput);

      expect(createUserMock).toBeCalledTimes(1);
      expect(createUserMock).toBeCalledWith(createUserInput);
    });

    it('should throw error while trying to register user with an already used email', async () => {
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue({ code: DatabaseErrorCode.UniqueViolation });

      await expect(authService.signUp(createUserInput)).rejects.toThrowError(ConflictException);
    });
  });
});
