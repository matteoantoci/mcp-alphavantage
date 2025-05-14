import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import type { AlphaVantageClient } from '../../alphaVantageClient.js';
import { currencyExchangeRateTool } from './currencyExchangeRate.js';
import { digitalCurrencyDailyTool } from './digitalCurrencyDaily.js';
import { digitalCurrencyWeeklyTool } from './digitalCurrencyWeekly.js';
import { digitalCurrencyMonthlyTool } from './digitalCurrencyMonthly.js';

/**
 * Registers cryptocurrency tools with the MCP server.
 * @param server The McpServer instance.
 * @param client The Alpha Vantage client instance.
 */
export const registerCryptoTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Crypto tools...');
  server.tool(
    currencyExchangeRateTool.name,
    currencyExchangeRateTool.description,
    currencyExchangeRateTool.inputSchemaShape.shape,
    wrapToolHandler((input) => currencyExchangeRateTool.handler(input, client))
  );
  server.tool(
    digitalCurrencyDailyTool.name,
    digitalCurrencyDailyTool.description,
    digitalCurrencyDailyTool.inputSchemaShape.shape,
    wrapToolHandler((input) => digitalCurrencyDailyTool.handler(input, client))
  );
  server.tool(
    digitalCurrencyWeeklyTool.name,
    digitalCurrencyWeeklyTool.description,
    digitalCurrencyWeeklyTool.inputSchemaShape.shape,
    wrapToolHandler((input) => digitalCurrencyWeeklyTool.handler(input, client))
  );
  server.tool(
    digitalCurrencyMonthlyTool.name,
    digitalCurrencyMonthlyTool.description,
    digitalCurrencyMonthlyTool.inputSchemaShape.shape,
    wrapToolHandler((input) => digitalCurrencyMonthlyTool.handler(input, client))
  );

  console.log('Finished registering Alpha Vantage Crypto tools.');
};
