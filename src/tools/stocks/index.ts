import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Import individual tool definitions for stocks
import { timeSeriesIntradayTool } from './timeSeriesIntraday.js';
import { timeSeriesDailyTool } from './timeSeriesDaily.js';
import { timeSeriesWeeklyTool } from './timeSeriesWeekly.js';
import { timeSeriesMonthlyTool } from './timeSeriesMonthly.js';
import { globalQuoteTool } from './globalQuote.js';
import { symbolSearchTool } from './symbolSearch.js';
import { marketStatusTool } from './marketStatus.js';

/**
 * Registers all Alpha Vantage Stocks tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerStocksTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Stocks tools...');
  // Register individual tools
  server.tool(
    timeSeriesIntradayTool.name,
    timeSeriesIntradayTool.description,
    timeSeriesIntradayTool.inputSchemaShape,
    (input) => timeSeriesIntradayTool.handler(input, apiKey)
  );
  server.tool(
    timeSeriesDailyTool.name,
    timeSeriesDailyTool.description,
    timeSeriesDailyTool.inputSchemaShape,
    (input) => timeSeriesDailyTool.handler(input, apiKey)
  );
  server.tool(
    timeSeriesWeeklyTool.name,
    timeSeriesWeeklyTool.description,
    timeSeriesWeeklyTool.inputSchemaShape,
    (input) => timeSeriesWeeklyTool.handler(input, apiKey)
  );
  server.tool(
    timeSeriesMonthlyTool.name,
    timeSeriesMonthlyTool.description,
    timeSeriesMonthlyTool.inputSchemaShape,
    (input) => timeSeriesMonthlyTool.handler(input, apiKey)
  );
  server.tool(globalQuoteTool.name, globalQuoteTool.description, globalQuoteTool.inputSchemaShape, (input) =>
    globalQuoteTool.handler(input, apiKey)
  );
  server.tool(symbolSearchTool.name, symbolSearchTool.description, symbolSearchTool.inputSchemaShape, (input) =>
    symbolSearchTool.handler(input, apiKey)
  );
  // marketStatusTool has an empty input schema, so its handler does not expect 'input'
  server.tool(marketStatusTool.name, marketStatusTool.description, marketStatusTool.inputSchemaShape, () =>
    marketStatusTool.handler(apiKey)
  );

  console.log('Finished registering Alpha Vantage Stocks tools.');
};
