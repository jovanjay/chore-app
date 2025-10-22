import { IsArray, IsUUID } from 'class-validator';

export class AssignKidsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  kidIds: string[];
}

