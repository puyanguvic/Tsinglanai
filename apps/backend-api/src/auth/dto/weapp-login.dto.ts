import { IsString } from 'class-validator';

export class WeappLoginDto {
  @IsString()
  code!: string;
}
