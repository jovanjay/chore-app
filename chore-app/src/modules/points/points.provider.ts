import { DataSource } from 'typeorm';
import { Points } from '../../database/entities/points.entity';

export const pointsProviders = [
  {
    provide: 'POINTS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Points),
    inject: ['DATA_SOURCE'],
  },
];

