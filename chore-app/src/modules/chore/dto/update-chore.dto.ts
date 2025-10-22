import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateChoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number; // Update points for the chore
}

