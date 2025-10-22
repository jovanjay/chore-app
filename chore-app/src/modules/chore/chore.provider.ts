import { DataSource } from 'typeorm';
import { Chore } from '../../database/entities/chore.entity';

export const choreProviders = [
  {
    provide: 'CHORE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Chore),
    inject: ['DATA_SOURCE'],
  },
];

