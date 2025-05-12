import { z } from 'zod';

const realGdpPerCapitaInputSchemaShape = {
  // Removed datatype parameter
  limit: z // Added limit parameter
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum number of time series items to return. If not set, returns all available items.'),
};

type RawSchemaShape = typeof realGdpPerCapitaInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any;

const realGdpPerCapitaHandler = async (input: Input, apiKey: string): Promise<Output> => {
  // Removed datatype from input destructuring
  const { limit } = input; // Destructure limit
  const params = new URLSearchParams({
    function: 'REAL_GDP_PER_CAPITA',
    apikey: apiKey,
    datatype: 'json', // Hardcoded datatype to 'json'
  });
  const url = `https://www.alphavantage.co/query?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
  // Removed CSV handling logic
  const data = await response.json();
  if (data['Error Message']) throw new Error(data['Error Message']);

  // Apply limit if provided without mutating original data
  const resultData =
    limit !== undefined && data.data && Array.isArray(data.data) ? { ...data, data: data.data.slice(0, limit) } : data;

  // Return processed data, wrapping is handled by wrapToolHandler
  return resultData;
};

type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, apiKey: string) => Promise<Output>;
};

export const realGdpPerCapitaTool: AlphaVantageToolDefinition = {
  name: 'real_gdp_per_capita',
  description: 'Fetches quarterly Real GDP per Capita of the United States.',
  inputSchemaShape: realGdpPerCapitaInputSchemaShape,
  handler: realGdpPerCapitaHandler,
};
