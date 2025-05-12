import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Import registration functions for each tool group
import { registerStocksTools } from './stocks/index.js';
import { registerOptionsTools } from './options/index.js';
import { registerIntelligenceTools } from './intelligence/index.js';
import { registerFundamentalsTools } from './fundamentals/index.js';
import { registerIndicatorsTools } from './indicators/index.js';
import { registerEconomicIndicatorsTools } from './economicIndicators/index.js';
import { registerCryptoTools } from './crypto/index.js';

/**
 * Registers all Alpha Vantage tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage tools...');
  // Call registration functions for each tool group
  registerStocksTools(server, apiKey);
  registerOptionsTools(server, apiKey);
  registerIntelligenceTools(server, apiKey);
  registerFundamentalsTools(server, apiKey);
  registerIndicatorsTools(server, apiKey); // Technical indicators from the original repo
  registerEconomicIndicatorsTools(server, apiKey);
  registerCryptoTools(server, apiKey);

  console.log('Finished registering Alpha Vantage tools.');
};
