import { Module } from '@nestjs/common';
import { LogPointService } from './log-point.service';
import { LogPointController } from './log-point.controller';
import {ConfigModule} from "@nestjs/config";

@Module({
  controllers: [LogPointController],
  providers: [LogPointService],
  imports: [ConfigModule],
})
export class LogPointModule {}
