import { IsString, IsUUID, IsOptional, MaxLength, IsArray, IsInt, Min } from 'class-validator';

export class CreateChoreDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number; // Points awarded for completing this chore (default: 0)

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  kidIds?: string[]; // Optional array of kid IDs to assign
}

