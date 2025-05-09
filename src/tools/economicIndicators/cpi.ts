import { z } from 'zod';

const cpiInputSchemaShape = {
  interval: z.enum(['monthly', 'semiannual']).optional().default('monthly')
    .describe('monthly or semiannual (default: monthly)'),
  datatype: z.enum(['json', 'csv']).optional().default('json')
    .describe('json or csv (default: json)'),
};

type RawSchemaShape = typeof cpiInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const cpiHandler = async (input: Input, apiKey: string): Promise<Output> => {
  const { interval, datatype } = input;
  const params = new URLSearchParams({
    function: 'CPI',
    apikey: apiKey,
    interval,
    datatype,
  });
  const url = `https://www.alphavantage.co/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  if (datatype === 'csv') return { data: await response.text(), format: 'csv' };
  const data = await response.json();
  if (data['Error Message']) throw new Error(data['Error Message']);
  return { data, format: 'json' };
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

export const cpiTool: AlphaVantageToolDefinition = {
  name: 'cpi',
  description: 'Fetches monthly and semiannual consumer price index (CPI) of the United States.',
  inputSchemaShape: cpiInputSchemaShape,
  handler: cpiHandler,
};
