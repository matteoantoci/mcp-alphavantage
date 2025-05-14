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

import type { AlphaVantageClient } from '../../alphaVantageClient.js';

/**
 * Registers all Alpha Vantage Stocks tools with the MCP server.
 * @param server The McpServer instance.
 * @param client The Alpha Vantage client instance.
 */
export const registerStocksTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Stocks tools...');
  // Register individual tools
  server.tool(
    timeSeriesIntradayTool.name,
    timeSeriesIntradayTool.description,
    timeSeriesIntradayTool.inputSchemaShape,
    wrapToolHandler((input) => timeSeriesIntradayTool.handler(input, client))
  );
  server.tool(
    timeSeriesDailyTool.name,
    timeSeriesDailyTool.description,
    timeSeriesDailyTool.inputSchemaShape,
    wrapToolHandler((input) => timeSeriesDailyTool.handler(input, client))
  );
  server.tool(
    timeSeriesWeeklyTool.name,
    timeSeriesWeeklyTool.description,
    timeSeriesWeeklyTool.inputSchemaShape,
    wrapToolHandler((input) => timeSeriesWeeklyTool.handler(input, client))
  );
  server.tool(
    timeSeriesMonthlyTool.name,
    timeSeriesMonthlyTool.description,
    timeSeriesMonthlyTool.inputSchemaShape,
    wrapToolHandler((input) => timeSeriesMonthlyTool.handler(input, client))
  );
  server.tool(
    globalQuoteTool.name,
    globalQuoteTool.description,
    globalQuoteTool.inputSchemaShape,
    wrapToolHandler((input) => globalQuoteTool.handler(input, client))
  );
  server.tool(
    symbolSearchTool.name,
    symbolSearchTool.description,
    symbolSearchTool.inputSchemaShape,
    wrapToolHandler((input) => symbolSearchTool.handler(input, client))
  );
  // marketStatusTool has an empty input schema, so its handler does not expect 'input'
  server.tool(
    marketStatusTool.name,
    marketStatusTool.description,
    marketStatusTool.inputSchemaShape,
    wrapToolHandler(() => marketStatusTool.handler(client))
  );

  console.log('Finished registering Alpha Vantage Stocks tools.');
};
