import { z } from 'zod';
import { type AlphaVantageApiParams, AlphaVantageClient } from '../../alphaVantageClient.js';

const inputSchema = z.object({
  symbol: z.string().min(1).describe('The digital/crypto currency symbol (e.g., ETH).'),
  market: z.string().min(1).describe('The exchange market (e.g., CNY, KRW).'),
});

const handler = async (input: z.infer<typeof inputSchema>, client: AlphaVantageClient) => {
  const { symbol, market } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'DIGITAL_CURRENCY_WEEKLY',
    symbol,
    market,
  };
  const data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  return data;
};

export const digitalCurrencyWeeklyTool = {
  name: 'digitalCurrencyWeekly',
  description: 'Fetches the weekly historical time series for a digital currency.',
  inputSchemaShape: inputSchema, // Use inputSchemaShape
  handler, // Export the raw handler
};
