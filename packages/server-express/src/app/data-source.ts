/*
 * 数据源配置
 * @Author: lilonglong
 * @Date: 2022-04-06 22:34:08
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-10 17:55:00
 */
import { DataSource } from 'typeorm';

/**
 * typeorm 数据源配置
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
  entities: ['node_modules/@toys/common/lib/entity/**/*.ts'],
  subscribers: [],
  migrations: [],
  timezone: 'Z', // https://github.com/typeorm/typeorm/issues/976#issuecomment-386925989
});
