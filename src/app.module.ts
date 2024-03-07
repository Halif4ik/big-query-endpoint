import { Module } from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { LogPointModule } from './log-point/log-point.module';

@Module({
  imports: [ ConfigModule.forRoot({
    envFilePath: `.env`,
    isGlobal: true,
  }), LogPointModule,],
})
export class AppModule {}
