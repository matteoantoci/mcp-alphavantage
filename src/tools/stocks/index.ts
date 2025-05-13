import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
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
    wrapToolHandler(timeSeriesIntradayTool.name, (input) => timeSeriesIntradayTool.handler(input, apiKey))
  );
  server.tool(
    timeSeriesDailyTool.name,
    timeSeriesDailyTool.description,
    timeSeriesDailyTool.inputSchemaShape,
    wrapToolHandler(timeSeriesDailyTool.name, (input) => timeSeriesDailyTool.handler(input, apiKey))
  );
  server.tool(
    timeSeriesWeeklyTool.name,
    timeSeriesWeeklyTool.description,
    timeSeriesWeeklyTool.inputSchemaShape,
    wrapToolHandler(timeSeriesWeeklyTool.name, (input) => timeSeriesWeeklyTool.handler(input, apiKey))
  );
  server.tool(
    timeSeriesMonthlyTool.name,
    timeSeriesMonthlyTool.description,
    timeSeriesMonthlyTool.inputSchemaShape,
    wrapToolHandler(timeSeriesMonthlyTool.name, (input) => timeSeriesMonthlyTool.handler(input, apiKey))
  );
  server.tool(
    globalQuoteTool.name,
    globalQuoteTool.description,
    globalQuoteTool.inputSchemaShape,
    wrapToolHandler(globalQuoteTool.name, (input) => globalQuoteTool.handler(input, apiKey))
  );
  server.tool(
    symbolSearchTool.name,
    symbolSearchTool.description,
    symbolSearchTool.inputSchemaShape,
    wrapToolHandler(symbolSearchTool.name, (input) => symbolSearchTool.handler(input, apiKey))
  );
  // marketStatusTool has an empty input schema, so its handler does not expect 'input'
  server.tool(
    marketStatusTool.name,
    marketStatusTool.description,
    marketStatusTool.inputSchemaShape,
    wrapToolHandler(marketStatusTool.name, () => marketStatusTool.handler(apiKey))
  );

  console.log('Finished registering Alpha Vantage Stocks tools.');
};
