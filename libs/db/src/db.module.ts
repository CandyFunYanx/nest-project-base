import { Module, Global } from '@nestjs/common';
import { DbService } from './db.service';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import envConfig from '@config/base';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envConfig.path,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get(
          'DB_HOST',
          'localhost',
        )}:${configService.get('DB_PORT', '27017')}`,
        dbName: configService.get('DB_DATABASE', 'test'),
        auth: {
          username: configService.get('DB_USER', 'root'),
          password: configService.get('DB_PASS', 'root'),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [ConfigService, DbService],
  exports: [ConfigService, DbService],
})
export class DbModule {}
