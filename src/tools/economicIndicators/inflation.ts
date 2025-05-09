import { z } from 'zod';

const inflationInputSchemaShape = {
  // Removed datatype parameter
};

type RawSchemaShape = typeof inflationInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const inflationHandler = async (input: Input, apiKey: string): Promise<Output> => {
  // Removed datatype from input destructuring
  const { } = input; // No required parameters left
  const params = new URLSearchParams({
    function: 'INFLATION',
    apikey: apiKey,
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

export const inflationTool: AlphaVantageToolDefinition = {
  name: 'inflation',
  description: 'Fetches annual inflation rates (consumer prices) of the United States.',
  inputSchemaShape: inflationInputSchemaShape,
  handler: inflationHandler,
};
