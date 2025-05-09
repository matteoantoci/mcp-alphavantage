import { z } from 'zod';

const realGdpInputSchemaShape = {
  interval: z.enum(['annual', 'quarterly']).optional().default('annual')
    .describe('annual or quarterly (default: annual)'),
  datatype: z.enum(['json', 'csv']).optional().default('json')
    .describe('json or csv (default: json)'),
};

type RawSchemaShape = typeof realGdpInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const realGdpHandler = async (input: Input, apiKey: string): Promise<Output> => {
  const { interval, datatype } = input;
  const params = new URLSearchParams({
    function: 'REAL_GDP',
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

export const realGdpTool: AlphaVantageToolDefinition = {
  name: 'real_gdp',
  description: 'Fetches annual and quarterly Real GDP of the United States.',
  inputSchemaShape: realGdpInputSchemaShape,
  handler: realGdpHandler,
};
