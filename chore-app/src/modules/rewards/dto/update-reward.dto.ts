import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class UpdateRewardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  pointsCost?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

