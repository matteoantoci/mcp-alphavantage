import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
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
  server.tool(
    realGdpTool.name,
    realGdpTool.description,
    realGdpTool.inputSchemaShape,
    wrapToolHandler(realGdpTool.name, (input) => realGdpTool.handler(input, apiKey))
  );
  server.tool(
    realGdpPerCapitaTool.name,
    realGdpPerCapitaTool.description,
    realGdpPerCapitaTool.inputSchemaShape,
    wrapToolHandler(realGdpPerCapitaTool.name, (input) => realGdpPerCapitaTool.handler(input, apiKey))
  );
  server.tool(
    treasuryYieldTool.name,
    treasuryYieldTool.description,
    treasuryYieldTool.inputSchemaShape,
    wrapToolHandler(treasuryYieldTool.name, (input) => treasuryYieldTool.handler(input, apiKey))
  );
  server.tool(
    federalFundsRateTool.name,
    federalFundsRateTool.description,
    federalFundsRateTool.inputSchemaShape,
    wrapToolHandler(federalFundsRateTool.name, (input) => federalFundsRateTool.handler(input, apiKey))
  );
  server.tool(
    cpiTool.name,
    cpiTool.description,
    cpiTool.inputSchemaShape,
    wrapToolHandler(cpiTool.name, (input) => cpiTool.handler(input, apiKey))
  );
  server.tool(
    inflationTool.name,
    inflationTool.description,
    inflationTool.inputSchemaShape,
    wrapToolHandler(inflationTool.name, (input) => inflationTool.handler(input, apiKey))
  );
  server.tool(
    retailSalesTool.name,
    retailSalesTool.description,
    retailSalesTool.inputSchemaShape,
    wrapToolHandler(retailSalesTool.name, (input) => retailSalesTool.handler(input, apiKey))
  );
  server.tool(
    durablesTool.name,
    durablesTool.description,
    durablesTool.inputSchemaShape,
    wrapToolHandler(durablesTool.name, (input) => durablesTool.handler(input, apiKey))
  );
  server.tool(
    unemploymentTool.name,
    unemploymentTool.description,
    unemploymentTool.inputSchemaShape,
    wrapToolHandler(unemploymentTool.name, (input) => unemploymentTool.handler(input, apiKey))
  );
  server.tool(
    nonfarmPayrollTool.name,
    nonfarmPayrollTool.description,
    nonfarmPayrollTool.inputSchemaShape,
    wrapToolHandler(nonfarmPayrollTool.name, (input) => nonfarmPayrollTool.handler(input, apiKey))
  );
  console.log('Finished registering Alpha Vantage Economic Indicators tools.');
};
