import { z } from 'zod';
import { type AlphaVantageApiParams, AlphaVantageClient } from '../../alphaVantageClient.js';

const inputSchema = z.object({
  symbol: z.string().min(1).describe('The digital/crypto currency symbol (e.g., LTC).'),
  market: z.string().min(1).describe('The exchange market (e.g., GBP, CAD).'),
});

const handler = async (input: z.infer<typeof inputSchema>, client: AlphaVantageClient) => {
  const { symbol, market } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'DIGITAL_CURRENCY_MONTHLY',
    symbol,
    market,
  };
  const data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  return data;
};

export const digitalCurrencyMonthlyTool = {
  name: 'digitalCurrencyMonthly',
  description: 'Fetches the monthly historical time series for a digital currency.',
  inputSchemaShape: inputSchema, // Use inputSchemaShape
  handler, // Export the raw handler
};
