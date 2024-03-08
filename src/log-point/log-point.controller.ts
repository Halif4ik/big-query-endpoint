import {Controller, Get, Post, Body, HttpCode} from '@nestjs/common';
import { LogPointService } from './log-point.service';
import { CreateLogPointDto } from './dto/create-log-point.dto';
import {ConfigService} from "@nestjs/config";

@Controller('openappevent')
export class LogPointController {
  constructor(private readonly logPointService: LogPointService) {}

  //1.All users can create new log with some data
  //Endpoint: POST /api/openappevent
  //Permissions: All members
  @Post()
  @HttpCode(200)
  createLog(@Body() createLogPointDto: CreateLogPointDto) {
    return this.logPointService.createLog(createLogPointDto);
  }
  //2.All users can get logs
   //Endpoint: GET /api/openappevent
   //Permissions: All members
   @Get()
  getLogs() {
    return this.logPointService.getLogs();
  }

}
