import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Import registration functions for each tool group
import { registerStocksTools } from './stocks/index.js';
import { registerOptionsTools } from './options/index.js';
import { registerIntelligenceTools } from './intelligence/index.js';
import { registerFundamentalsTools } from './fundamentals/index.js';
import { registerIndicatorsTools } from './indicators/index.js';
import { registerEconomicIndicatorsTools } from './economicIndicators/index.js';
import { registerCryptoTools } from './crypto/index.js';

import type { AlphaVantageClient } from '../alphaVantageClient.js';

/**
 * Registers all Alpha Vantage tools with the MCP server.
 * @param server The McpServer instance.
 * @param client The Alpha Vantage client instance.
 */
export const registerTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage tools...');
  // Call registration functions for each tool group
  registerStocksTools(server, client);
  registerOptionsTools(server, client);
  registerIntelligenceTools(server, client);
  registerFundamentalsTools(server, client);
  registerIndicatorsTools(server, client); // Technical indicators from the original repo
  registerEconomicIndicatorsTools(server, client);
  registerCryptoTools(server, client);

  console.log('Finished registering Alpha Vantage tools.');
};
