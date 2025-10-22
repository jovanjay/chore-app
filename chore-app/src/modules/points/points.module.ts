import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { pointsProviders } from './points.provider';
import { kidsProviders } from '../kids/kids.provider';
import { userProviders } from '../user/user.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PointsController],
  providers: [
    ...pointsProviders,
    ...kidsProviders,
    ...userProviders,
    PointsService,
    {
      provide: 'PointsService',
      useExisting: PointsService,
    },
  ],
  exports: [PointsService, 'PointsService', ...pointsProviders],
})
export class PointsModule {}

