import { Module, forwardRef } from '@nestjs/common';
import { ChoreService } from './chore.service';
import { ChoreController } from './chore.controller';
import { choreProviders } from './chore.provider';
import { kidsProviders } from '../kids/kids.provider';
import { userProviders } from '../user/user.provider';
import { PointsModule } from '../points/points.module';
import { S3Module } from '../s3/s3.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, S3Module, forwardRef(() => PointsModule)],
  controllers: [ChoreController],
  providers: [
    ...choreProviders,
    ...kidsProviders,
    ...userProviders,
    ChoreService,
    {
      provide: 'POINTS_SERVICE',
      useFactory: (pointsModule) => pointsModule,
      inject: ['PointsService'],
    },
  ],
  exports: [ChoreService, ...choreProviders],
})
export class ChoreModule {}

