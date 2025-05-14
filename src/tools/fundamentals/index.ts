import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import type { AlphaVantageClient } from '../../alphaVantageClient.js';
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
 * @param client The Alpha Vantage client instance.
 */
export const registerFundamentalsTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Fundamentals tools...');
  // Register individual tools
  server.tool(
    companyOverviewTool.name,
    companyOverviewTool.description,
    companyOverviewTool.inputSchemaShape,
    wrapToolHandler((input) => companyOverviewTool.handler(input, client))
  );
  server.tool(
    etfProfileTool.name,
    etfProfileTool.description,
    etfProfileTool.inputSchemaShape,
    wrapToolHandler((input) => etfProfileTool.handler(input, client))
  );
  server.tool(
    dividendsTool.name,
    dividendsTool.description,
    dividendsTool.inputSchemaShape,
    wrapToolHandler((input) => dividendsTool.handler(input, client))
  );
  server.tool(
    splitsTool.name,
    splitsTool.description,
    splitsTool.inputSchemaShape,
    wrapToolHandler((input) => splitsTool.handler(input, client))
  );
  server.tool(
    incomeStatementTool.name,
    incomeStatementTool.description,
    incomeStatementTool.inputSchemaShape,
    wrapToolHandler((input) => incomeStatementTool.handler(input, client))
  );
  server.tool(
    balanceSheetTool.name,
    balanceSheetTool.description,
    balanceSheetTool.inputSchemaShape,
    wrapToolHandler((input) => balanceSheetTool.handler(input, client))
  );
  server.tool(
    cashFlowTool.name,
    cashFlowTool.description,
    cashFlowTool.inputSchemaShape,
    wrapToolHandler((input) => cashFlowTool.handler(input, client))
  );
  server.tool(
    earningsTool.name,
    earningsTool.description,
    earningsTool.inputSchemaShape,
    wrapToolHandler((input) => earningsTool.handler(input, client))
  );
  server.tool(
    listingStatusTool.name,
    listingStatusTool.description,
    listingStatusTool.inputSchemaShape,
    wrapToolHandler((input) => listingStatusTool.handler(input, client))
  );
  server.tool(
    earningsCalendarTool.name,
    earningsCalendarTool.description,
    earningsCalendarTool.inputSchemaShape,
    wrapToolHandler((input) => earningsCalendarTool.handler(input, client))
  );
  server.tool(
    ipoCalendarTool.name,
    ipoCalendarTool.description,
    ipoCalendarTool.inputSchemaShape,
    wrapToolHandler((input) => ipoCalendarTool.handler(input, client))
  );

  console.log('Finished registering Alpha Vantage Fundamentals tools.');
};
