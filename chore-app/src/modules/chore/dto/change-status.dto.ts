import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChoreStatus } from '../../../database/entities/chore.entity';

export class ChangeStatusDto {
  @IsEnum(ChoreStatus)
  status: ChoreStatus;

  @IsOptional()
  @IsString()
  photo?: string; // Photo URL when kid finishes the chore
}

