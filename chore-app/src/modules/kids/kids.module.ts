import { Module } from '@nestjs/common';
import { KidsService } from './kids.service';
import { KidsController } from './kids.controller';
import { kidsProviders } from './kids.provider';
import { userProviders } from '../user/user.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KidsController],
  providers: [...kidsProviders, ...userProviders, KidsService],
  exports: [KidsService, ...kidsProviders],
})
export class KidsModule {}

