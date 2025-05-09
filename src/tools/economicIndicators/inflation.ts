import { z } from 'zod';

const inflationInputSchemaShape = {
  datatype: z.enum(['json', 'csv']).optional().default('json')
    .describe('json or csv (default: json)'),
};

type RawSchemaShape = typeof inflationInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const inflationHandler = async (input: Input, apiKey: string): Promise<Output> => {
  const { datatype } = input;
  const params = new URLSearchParams({
    function: 'INFLATION',
    apikey: apiKey,
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

export const inflationTool: AlphaVantageToolDefinition = {
  name: 'inflation',
  description: 'Fetches annual inflation rates (consumer prices) of the United States.',
  inputSchemaShape: inflationInputSchemaShape,
  handler: inflationHandler,
};
