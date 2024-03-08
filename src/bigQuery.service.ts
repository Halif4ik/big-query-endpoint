import {BigQuery} from '@google-cloud/bigquery';

export const bigquery: BigQuery = new BigQuery({
   projectId: process.env.PROJECT_ID,
   keyFilename: process.env.KEY_FILENAME,
});
