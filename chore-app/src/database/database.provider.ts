import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_ROOT_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'chore_app',
        entities: [`${__dirname}/../database/entities/**/*.entity{.ts,.js}`],
        synchronize: true, // Set to false in production
      });

      return dataSource.initialize();
    },
  },
];

