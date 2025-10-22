import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemRewardDto {
  @IsUUID()
  @IsNotEmpty()
  rewardId: string;
}

