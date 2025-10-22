import { DataSource } from 'typeorm';
import { Kids } from '../../database/entities/kids.entity';

export const kidsProviders = [
  {
    provide: 'KIDS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Kids),
    inject: ['DATA_SOURCE'],
  },
];

