import { DataSource } from 'typeorm';
import { Reward } from '../../database/entities/reward.entity';

export const rewardsProviders = [
  {
    provide: 'REWARDS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Reward),
    inject: ['DATA_SOURCE'],
  },
];

