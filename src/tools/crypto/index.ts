import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import { currencyExchangeRateTool } from './currencyExchangeRate.js';
import { digitalCurrencyDailyTool } from './digitalCurrencyDaily.js';
import { digitalCurrencyWeeklyTool } from './digitalCurrencyWeekly.js';
import { digitalCurrencyMonthlyTool } from './digitalCurrencyMonthly.js';

/**
 * Registers cryptocurrency tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerCryptoTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Crypto tools...');
  server.tool(
    currencyExchangeRateTool.name,
    currencyExchangeRateTool.description,
    currencyExchangeRateTool.inputSchemaShape.shape, // Use .shape
    wrapToolHandler((input) => currencyExchangeRateTool.handler(input, apiKey))
  );
  server.tool(
    digitalCurrencyDailyTool.name,
    digitalCurrencyDailyTool.description,
    digitalCurrencyDailyTool.inputSchemaShape.shape, // Use .shape
    wrapToolHandler((input) => digitalCurrencyDailyTool.handler(input, apiKey))
  );
  server.tool(
    digitalCurrencyWeeklyTool.name,
    digitalCurrencyWeeklyTool.description,
    digitalCurrencyWeeklyTool.inputSchemaShape.shape, // Use .shape
    wrapToolHandler((input) => digitalCurrencyWeeklyTool.handler(input, apiKey))
  );
  server.tool(
    digitalCurrencyMonthlyTool.name,
    digitalCurrencyMonthlyTool.description,
    digitalCurrencyMonthlyTool.inputSchemaShape.shape, // Use .shape
    wrapToolHandler((input) => digitalCurrencyMonthlyTool.handler(input, apiKey))
  );

  console.log('Finished registering Alpha Vantage Crypto tools.');
};
