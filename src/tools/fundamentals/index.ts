import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
// Import individual tool definitions for fundamentals
import { companyOverviewTool } from './companyOverview.js';
import { etfProfileTool } from './etfProfile.js';
import { dividendsTool } from './dividends.js';
import { splitsTool } from './splits.js';
import { incomeStatementTool } from './incomeStatement.js';
import { balanceSheetTool } from './balanceSheet.js';
import { cashFlowTool } from './cashFlow.js';
import { earningsTool } from './earnings.js';
import { listingStatusTool } from './listingStatus.js';
import { earningsCalendarTool } from './earningsCalendar.js';
import { ipoCalendarTool } from './ipoCalendar.js';

/**
 * Registers all Alpha Vantage Fundamentals tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerFundamentalsTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Fundamentals tools...');
  // Register individual tools
  server.tool(
    companyOverviewTool.name,
    companyOverviewTool.description,
    companyOverviewTool.inputSchemaShape,
    wrapToolHandler((input) => companyOverviewTool.handler(input, apiKey))
  );
  server.tool(
    etfProfileTool.name,
    etfProfileTool.description,
    etfProfileTool.inputSchemaShape,
    wrapToolHandler((input) => etfProfileTool.handler(input, apiKey))
  );
  server.tool(
    dividendsTool.name,
    dividendsTool.description,
    dividendsTool.inputSchemaShape,
    wrapToolHandler((input) => dividendsTool.handler(input, apiKey))
  );
  server.tool(
    splitsTool.name,
    splitsTool.description,
    splitsTool.inputSchemaShape,
    wrapToolHandler((input) => splitsTool.handler(input, apiKey))
  );
  server.tool(
    incomeStatementTool.name,
    incomeStatementTool.description,
    incomeStatementTool.inputSchemaShape,
    wrapToolHandler((input) => incomeStatementTool.handler(input, apiKey))
  );
  server.tool(
    balanceSheetTool.name,
    balanceSheetTool.description,
    balanceSheetTool.inputSchemaShape,
    wrapToolHandler((input) => balanceSheetTool.handler(input, apiKey))
  );
  server.tool(
    cashFlowTool.name,
    cashFlowTool.description,
    cashFlowTool.inputSchemaShape,
    wrapToolHandler((input) => cashFlowTool.handler(input, apiKey))
  );
  server.tool(
    earningsTool.name,
    earningsTool.description,
    earningsTool.inputSchemaShape,
    wrapToolHandler((input) => earningsTool.handler(input, apiKey))
  );
  server.tool(
    listingStatusTool.name,
    listingStatusTool.description,
    listingStatusTool.inputSchemaShape,
    wrapToolHandler((input) => listingStatusTool.handler(input, apiKey))
  );
  server.tool(
    earningsCalendarTool.name,
    earningsCalendarTool.description,
    earningsCalendarTool.inputSchemaShape,
    wrapToolHandler((input) => earningsCalendarTool.handler(input, apiKey))
  );
  server.tool(
    ipoCalendarTool.name,
    ipoCalendarTool.description,
    ipoCalendarTool.inputSchemaShape,
    wrapToolHandler((input) => ipoCalendarTool.handler(input, apiKey))
  );

  console.log('Finished registering Alpha Vantage Fundamentals tools.');
};
