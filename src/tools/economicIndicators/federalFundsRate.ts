import { z } from 'zod';

const federalFundsRateInputSchemaShape = {
  interval: z.enum(['daily', 'weekly', 'monthly']).optional().default('monthly')
    .describe('daily, weekly, or monthly (default: monthly)'),
  datatype: z.enum(['json', 'csv']).optional().default('json')
    .describe('json or csv (default: json)'),
};

type RawSchemaShape = typeof federalFundsRateInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const federalFundsRateHandler = async (input: Input, apiKey: string): Promise<Output> => {
  const { interval, datatype } = input;
  const params = new URLSearchParams({
    function: 'FEDERAL_FUNDS_RATE',
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

export const federalFundsRateTool: AlphaVantageToolDefinition = {
  name: 'federal_funds_rate',
  description: 'Fetches daily, weekly, and monthly federal funds rate (interest rate) of the United States.',
  inputSchemaShape: federalFundsRateInputSchemaShape,
  handler: federalFundsRateHandler,
};
