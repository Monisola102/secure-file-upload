import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { User } from "./users/entities/user.entity";
import { File } from "./files/entities/file.entity";

export const pgConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [User, File],
  synchronize: true,
  logging: false,
}