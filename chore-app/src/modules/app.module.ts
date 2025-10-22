import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { KidsModule } from './kids/kids.module';
import { ChoreModule } from './chore/chore.module';
import { PointsModule } from './points/points.module';
import { RewardsModule } from './rewards/rewards.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, KidsModule, ChoreModule, PointsModule, RewardsModule],
})
export class AppModule {}

