import { z } from 'zod';

const inputSchema = z.object({
  from_currency: z
    .string()
    .min(1)
    .describe('The currency you would like to get the exchange rate for (e.g., BTC, USD).'),
  to_currency: z.string().min(1).describe('The destination currency for the exchange rate (e.g., EUR, JPY).'),
});

// Modify handler to accept apiKey as a parameter
const handler = async (input: z.infer<typeof inputSchema>, apiKey: string) => {
  const { from_currency, to_currency } = input;
  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${encodeURIComponent(from_currency)}&to_currency=${encodeURIComponent(to_currency)}&apikey=${apiKey}`;

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

export const currencyExchangeRateTool = {
  name: 'currencyExchangeRate',
  description: 'Fetches the realtime exchange rate for a pair of digital or physical currencies.',
  inputSchemaShape: inputSchema, // Use inputSchemaShape
  handler, // Export the raw handler
};
