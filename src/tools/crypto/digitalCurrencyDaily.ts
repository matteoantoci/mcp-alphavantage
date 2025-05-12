import { z } from 'zod';

const inputSchema = z.object({
  symbol: z.string().min(1).describe('The digital/crypto currency symbol (e.g., BTC).'),
  market: z.string().min(1).describe('The exchange market (e.g., USD, EUR).'),
});

// Modify handler to accept apiKey as a parameter
const handler = async (input: z.infer<typeof inputSchema>, apiKey: string) => {
  const { symbol, market } = input;
  const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${encodeURIComponent(
    symbol
  )}&market=${encodeURIComponent(market)}&apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
  }
  const data = await response.json();
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  return data;
};

export const digitalCurrencyDailyTool = {
  name: 'digitalCurrencyDaily',
  description: 'Fetches the daily historical time series for a digital currency.',
  inputSchemaShape: inputSchema, // Use inputSchemaShape
  handler, // Export the raw handler
};
