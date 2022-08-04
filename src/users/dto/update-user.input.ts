import { IsOptional, IsUrl, Length } from 'class-validator';

export class UpdateUserInput {
  @Length(2, 64)
  name: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
