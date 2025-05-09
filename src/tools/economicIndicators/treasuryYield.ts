import { z } from 'zod';

const treasuryYieldInputSchemaShape = {
  interval: z.enum(['daily', 'weekly', 'monthly']).optional().default('monthly')
    .describe('daily, weekly, or monthly (default: monthly)'),
  maturity: z.enum(['3month', '2year', '5year', '7year', '10year', '30year']).optional().default('10year')
    .describe('3month, 2year, 5year, 7year, 10year, or 30year (default: 10year)'),
  datatype: z.enum(['json', 'csv']).optional().default('json')
    .describe('json or csv (default: json)'),
};

type RawSchemaShape = typeof treasuryYieldInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const treasuryYieldHandler = async (input: Input, apiKey: string): Promise<Output> => {
  const { interval, maturity, datatype } = input;
  const params = new URLSearchParams({
    function: 'TREASURY_YIELD',
    apikey: apiKey,
    interval,
    maturity,
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

export const treasuryYieldTool: AlphaVantageToolDefinition = {
  name: 'treasury_yield',
  description: 'Fetches daily, weekly, and monthly US treasury yield for a given maturity timeline.',
  inputSchemaShape: treasuryYieldInputSchemaShape,
  handler: treasuryYieldHandler,
};
