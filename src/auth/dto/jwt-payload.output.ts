import { Exclude } from 'class-transformer';

export class JwtPayload {
  sub: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;

  @Exclude()
  exp: number;

  @Exclude()
  iat: number;
}
