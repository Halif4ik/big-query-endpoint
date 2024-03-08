import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {CreateLogPointDto} from './dto/create-log-point.dto';
import {ConfigService} from '@nestjs/config';
import {Dataset, TableResponse} from "@google-cloud/bigquery";
import {GeneralResponse} from "./interface/generalResponse.interface";
import {BigQuery} from '@google-cloud/bigquery';

@Injectable()
export class LogPointService {
   private readonly logger: Logger = new Logger(LogPointService.name);
   private readonly datasetId: string = this.configService.get<string>("DB_NAME");
   private readonly tableId: string = this.configService.get<string>('TABLE_NAME');
   private readonly limit: number = this.configService.get<number>('LIMIT');
   private readonly bigquery: BigQuery = new BigQuery({
      projectId: this.configService.get<string>('PROJECT_ID'),
      keyFilename: this.configService.get<string>('KEY_FILENAME'),
   });

   constructor(private readonly configService: ConfigService) {
   }

   private async createTableWithSchema(): Promise<void> {

      const schema = [
         {name: 'idUser', type: 'STRING'},
         {name: 'idDevice', type: 'STRING'},
         {name: 'os', type: 'STRING'},
      ];

      const options = {schema: schema};
      const bigQDataSet: Dataset = this.bigquery.dataset(this.datasetId);
      try {
         // Check if table exists before attempting to create it
         const [tableExists] = await bigQDataSet.table(this.tableId).exists();
         if (!tableExists) {
            console.log('tableExists-',tableExists);
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

   // Execute Constructed the SQL query to insert data into the table
   private async insertData(createLogPointDto: CreateLogPointDto): Promise<void> {
      const {idUser, idDevice, os} = createLogPointDto;
      await this.bigquery.query({
         query: `INSERT INTO ${this.datasetId}.${this.tableId} (idUser, idDevice, os) VALUES ('${idUser}', '${idDevice}', '${os}')`,
         location: 'EU',
      });
   }

   async createLog(createLogPointDto: CreateLogPointDto): Promise<GeneralResponse> {
      try {
         await this.createTableWithSchema();
         await this.insertData(createLogPointDto);
      } catch (error) {
         throw new HttpException(
             {
                "success": false,
                "errors_message": error?.errors?.[0] || error,
                "data": null
             },
             HttpStatus.BAD_REQUEST,
         );
      }
      return {
         "success": true,
         "errors_message": null,
         "data": "Successfully"
      }
   }

   async getLogs(): Promise<GeneralResponse> {
      let resp = null;
      try {
         const query = `SELECT * FROM ${this.datasetId}.${this.tableId} LIMIT ${this.limit}`;
         const options = {
            query: query,
            location: 'EU',
         };
         resp = await this.bigquery.query(options);
      } catch (error) {
         throw new HttpException(
             {
                "success": false,
                "errors_message": error?.errors?.[0] || error,
                "data": null
             },
             HttpStatus.BAD_REQUEST,
         );
      }
      return {
         "success": true,
         "errors_message": null,
         "data": JSON.stringify(resp) || null
      }
   }
}
