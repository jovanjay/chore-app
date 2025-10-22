import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { rewardsProviders } from './rewards.provider';
import { pointsProviders } from '../points/points.provider';
import { kidsProviders } from '../kids/kids.provider';
import { userProviders } from '../user/user.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RewardsController],
  providers: [
    ...rewardsProviders,
    ...pointsProviders,
    ...kidsProviders,
    ...userProviders,
    RewardsService,
  ],
  exports: [RewardsService, ...rewardsProviders],
})
export class RewardsModule {}

