import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { pgConfig } from './dbConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(pgConfig),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL!),
        limit: Number(process.env.THROTTLE_LIMIT!)
      },
    ]),
    AuthModule,
    UsersModule,
    FilesModule,
  ],
})
export class AppModule {}