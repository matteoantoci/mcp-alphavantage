import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { realGdpTool } from './realGdp.js';
import { realGdpPerCapitaTool } from './realGdpPerCapita.js';
import { treasuryYieldTool } from './treasuryYield.js';
import { federalFundsRateTool } from './federalFundsRate.js';
import { cpiTool } from './cpi.js';
import { inflationTool } from './inflation.js';
import { retailSalesTool } from './retailSales.js';
import { durablesTool } from './durables.js';
import { unemploymentTool } from './unemployment.js';
import { nonfarmPayrollTool } from './nonfarmPayroll.js';

export const registerEconomicIndicatorsTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Economic Indicators tools...');
  server.tool(realGdpTool.name, realGdpTool.description, realGdpTool.inputSchemaShape, (input) => realGdpTool.handler(input, apiKey));
  server.tool(realGdpPerCapitaTool.name, realGdpPerCapitaTool.description, realGdpPerCapitaTool.inputSchemaShape, (input) => realGdpPerCapitaTool.handler(input, apiKey));
  server.tool(treasuryYieldTool.name, treasuryYieldTool.description, treasuryYieldTool.inputSchemaShape, (input) => treasuryYieldTool.handler(input, apiKey));
  server.tool(federalFundsRateTool.name, federalFundsRateTool.description, federalFundsRateTool.inputSchemaShape, (input) => federalFundsRateTool.handler(input, apiKey));
  server.tool(cpiTool.name, cpiTool.description, cpiTool.inputSchemaShape, (input) => cpiTool.handler(input, apiKey));
  server.tool(inflationTool.name, inflationTool.description, inflationTool.inputSchemaShape, (input) => inflationTool.handler(input, apiKey));
  server.tool(retailSalesTool.name, retailSalesTool.description, retailSalesTool.inputSchemaShape, (input) => retailSalesTool.handler(input, apiKey));
  server.tool(durablesTool.name, durablesTool.description, durablesTool.inputSchemaShape, (input) => durablesTool.handler(input, apiKey));
  server.tool(unemploymentTool.name, unemploymentTool.description, unemploymentTool.inputSchemaShape, (input) => unemploymentTool.handler(input, apiKey));
  server.tool(nonfarmPayrollTool.name, nonfarmPayrollTool.description, nonfarmPayrollTool.inputSchemaShape, (input) => nonfarmPayrollTool.handler(input, apiKey));
  console.log('Finished registering Alpha Vantage Economic Indicators tools.');
};
