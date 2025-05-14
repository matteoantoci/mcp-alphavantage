import { z } from 'zod';
import { type AlphaVantageApiParams, AlphaVantageClient } from '../../alphaVantageClient.js';

const inputSchema = z.object({
  from_currency: z
    .string()
    .min(1)
    .describe('The currency you would like to get the exchange rate for (e.g., BTC, USD).'),
  to_currency: z.string().min(1).describe('The destination currency for the exchange rate (e.g., EUR, JPY).'),
});

const handler = async (input: z.infer<typeof inputSchema>, client: AlphaVantageClient) => {
  const { from_currency, to_currency } = input;
  const apiRequestParams: AlphaVantageApiParams = {
    apiFunction: 'CURRENCY_EXCHANGE_RATE',
    from_currency,
    to_currency,
  };
  const data = await client.fetchApiData(apiRequestParams);
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  return data;
};

export const currencyExchangeRateTool = {
  name: 'currencyExchangeRate',
  description: 'Fetches the realtime exchange rate for a pair of digital or physical currencies.',
  inputSchemaShape: inputSchema, // Use inputSchemaShape
  handler, // Export the raw handler
};
