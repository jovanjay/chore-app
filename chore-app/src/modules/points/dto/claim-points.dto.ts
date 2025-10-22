import { IsArray, IsUUID } from 'class-validator';

export class ClaimPointsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  pointIds: string[]; // Array of point IDs to claim
}

