import { BigQuery } from '@google-cloud/bigquery';

export const bigquery = new BigQuery({
  projectId: 'point-log-416512',
  keyFilename: `./point-log-416512-61e2de002e51.json`,
});
