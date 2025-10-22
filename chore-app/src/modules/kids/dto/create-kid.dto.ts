import { IsString, IsOptional, IsDateString, IsInt, IsIn, Min, Max } from 'class-validator';

export class CreateKidDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(18)
  age?: number;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  notes?: string;
}

