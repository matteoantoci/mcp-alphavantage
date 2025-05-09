import { z } from 'zod';

const treasuryYieldInputSchemaShape = {
  interval: z.enum(['daily', 'weekly', 'monthly']).optional().default('monthly')
    .describe('daily, weekly, or monthly (default: monthly)'),
  maturity: z.enum(['3month', '2year', '5year', '7year', '10year', '30year']).optional().default('10year')
    .describe('3month, 2year, 5year, 7year, 10year, or 30year (default: 10year)'),
  // Removed datatype parameter
};

type RawSchemaShape = typeof treasuryYieldInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const treasuryYieldHandler = async (input: Input, apiKey: string): Promise<Output> => {
  // Removed datatype from input destructuring
  const { interval, maturity } = input;
  const params = new URLSearchParams({
    function: 'TREASURY_YIELD',
    apikey: apiKey,
    interval,
    maturity,
    datatype: 'json', // Hardcoded datatype to 'json'
  });
  const url = `https://www.alphavantage.co/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  // Removed CSV handling logic
  const data = await response.json();
  if (data['Error Message']) throw new Error(data['Error Message']);
  // Return raw data, wrapping is handled by wrapToolHandler
  return data;
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
