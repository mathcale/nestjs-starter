import { Body, Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserInput } from '../users/dto/create-user.input';
import { SignInInput } from './dto/sign-in.input';
import { User } from '../users/entities/user.entity';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() signInInput: SignInInput) {
    this.logger.log('Starting user sign in flow...');
    return this.authService.signIn(signInInput);
  }

  @Post('/signup')
  signUp(@Body() createUserInput: CreateUserInput) {
    this.logger.log('Starting user registration flow...');
    return this.authService.signUp(createUserInput);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getCurrentUser(@Req() req: any): Promise<User> {
    return req.user;
  }
}
