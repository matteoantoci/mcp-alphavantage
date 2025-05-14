import { z } from 'zod';
import type { AlphaVantageClient, AlphaVantageApiParams } from '../../alphaVantageClient.js';

// Define the input schema shape for the IPO_CALENDAR tool
const ipoCalendarInputSchemaShape = {
  // Removed datatype parameter
};

type RawSchemaShape = typeof ipoCalendarInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
type Output = any; // TODO: Define a more specific output type based on Alpha Vantage response

// Define the handler function for the IPO_CALENDAR tool
const ipoCalendarHandler = async (_input: Input, client: AlphaVantageClient): Promise<Output> => {
  try {
    const apiRequestParams: AlphaVantageApiParams = {
      apiFunction: 'IPO_CALENDAR',
      datatype: 'json',
    };

    const data = await client.fetchApiData(apiRequestParams);

    return data;
  } catch (error: unknown) {
    console.error('IPO_CALENDAR tool error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`IPO_CALENDAR tool failed: ${message}`);
  }
};

// Define the tool definition object structure
type AlphaVantageToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input, client: AlphaVantageClient) => Promise<Output>;
};

export const ipoCalendarTool: AlphaVantageToolDefinition = {
  name: 'ipo_calendar',
  description: 'Fetches a list of IPOs expected in the next 3 months.',
  inputSchemaShape: ipoCalendarInputSchemaShape,
  handler: ipoCalendarHandler,
};
