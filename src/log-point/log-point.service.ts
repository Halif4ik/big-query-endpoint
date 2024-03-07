import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {CreateLogPointDto} from './dto/create-log-point.dto';
import {bigquery} from '../bigQuery.service';
import {ConfigService} from '@nestjs/config';
import {Dataset, SimpleQueryRowsResponse, TableResponse} from "@google-cloud/bigquery";

@Injectable()
export class LogPointService {
   private readonly logger: Logger = new Logger(LogPointService.name);
   private readonly datasetId: string = this.configService.get<string>("DB_NAME");
   private readonly tableId: string = this.configService.get<string>('TABLE_NAME');
   private readonly limit: number = this.configService.get<number>('LIMIT');

   constructor(private readonly configService: ConfigService) {
   }

   private async createTableWithSchema(): Promise<void> {

      const schema = [
         {name: 'idUser', type: 'STRING'},
         {name: 'idDevice', type: 'STRING'},
         {name: 'os', type: 'STRING'},
      ];

      const options = {schema: schema};
      const bigQDataSet: Dataset = bigquery.dataset(this.datasetId);
      try {
         // Check if table exists before attempting to create it
         const [tableExists] = await bigQDataSet.table(this.tableId).exists();
         if (!tableExists) {
            const resp: TableResponse = await bigQDataSet.createTable(this.tableId, options);
            this.logger.log(`CreatedTable ${this.datasetId}.${this.tableId}`);
         }

         // Need ensure it has a schema If table has no schema or empty schema, update the schema
         const [metadata] = await bigQDataSet.table(this.tableId).getMetadata();
         if (!metadata.schema?.fields?.length) {
            await bigQDataSet.table(this.tableId).setMetadata({schema: schema});
            this.logger.log(`Created schema for table ${this.datasetId}.${this.tableId}`);
         }
      } catch (error) {
         console.error(`Error createTable-` + error);
      }
   }

   private async insertData(createLogPointDto: CreateLogPointDto): Promise<void> {
      const datasetId = 'pointDb';
      const tableId = 'tableLogger';

      const {idUser, idDevice, os} = createLogPointDto;
      // Execute Constructed the SQL query to insert data into the table
      await bigquery.query({
         query: `INSERT INTO ${datasetId}.${tableId} (idUser, idDevice, os) VALUES ('${idUser}', '${idDevice}', '${os}')`,
         location: 'EU',
      });
   }

   async createLog(createLogPointDto: CreateLogPointDto) {
      try {
         await this.createTableWithSchema();
         // Insert data into the table
         await this.insertData(createLogPointDto);
      } catch (error) {
         console.error(`In ERROR-` + error);
      }
      return {
         status_code: HttpStatus.OK,
         detail: {
            idUser: createLogPointDto.idUser,
         },
         result: 'created',
      };
   }

   async getLogs(): Promise<any> {
      let resp = null;
      try {
         const query = `SELECT * FROM ${this.datasetId}.${this.tableId} LIMIT ${this.limit}`;
         const options = {
            query: query,
            location: 'EU',
         };
         resp = await bigquery.query(options);
      } catch (error) {
         console.error(`ERROR Get-` + error);
      }

      return {
         status_code: HttpStatus.OK,
         detail: {
            list: resp,
         },
         result: 'created',
      };
   }
}
