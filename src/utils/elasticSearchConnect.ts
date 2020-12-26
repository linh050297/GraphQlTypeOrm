import { Client } from 'elasticsearch';

const client = new Client({
  host: 'localhost:9200',
  log: 'trace',
  apiVersion: '7.2',
  httpAuth: ''
});

export default client;