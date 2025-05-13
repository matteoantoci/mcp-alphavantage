import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
// Import individual tool definitions for indicators
import { smaTool } from './sma.js';
import { emaTool } from './ema.js';
import { rsiTool } from './rsi.js';
import { bbandsTool } from './bbands.js';
import { adxTool } from './adx.js';
import { obvTool } from './obv.js';
import { atrTool } from './atr.js';
import { adTool } from './ad.js';
import { stochTool } from './stoch.js';
import { aroonTool } from './aroon.js';

/**
 * Registers all Alpha Vantage Technical Indicators tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerIndicatorsTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Technical Indicators tools...');
  // Register individual tools
  server.tool(
    smaTool.name,
    smaTool.description,
    smaTool.inputSchemaShape,
    wrapToolHandler(smaTool.name, (input) => smaTool.handler(input, apiKey))
  );
  server.tool(
    emaTool.name,
    emaTool.description,
    emaTool.inputSchemaShape,
    wrapToolHandler(emaTool.name, (input) => emaTool.handler(input, apiKey))
  );
  server.tool(
    rsiTool.name,
    rsiTool.description,
    rsiTool.inputSchemaShape,
    wrapToolHandler(rsiTool.name, (input) => rsiTool.handler(input, apiKey))
  );
  server.tool(
    bbandsTool.name,
    bbandsTool.description,
    bbandsTool.inputSchemaShape,
    wrapToolHandler(bbandsTool.name, (input) => bbandsTool.handler(input, apiKey))
  );
  server.tool(
    adxTool.name,
    adxTool.description,
    adxTool.inputSchemaShape,
    wrapToolHandler(adxTool.name, (input) => adxTool.handler(input, apiKey))
  );
  server.tool(
    obvTool.name,
    obvTool.description,
    obvTool.inputSchemaShape,
    wrapToolHandler(obvTool.name, (input) => obvTool.handler(input, apiKey))
  );
  server.tool(
    atrTool.name,
    atrTool.description,
    atrTool.inputSchemaShape,
    wrapToolHandler(atrTool.name, (input) => atrTool.handler(input, apiKey))
  );
  server.tool(
    adTool.name,
    adTool.description,
    adTool.inputSchemaShape,
    wrapToolHandler(adTool.name, (input) => adTool.handler(input, apiKey))
  );
  server.tool(
    stochTool.name,
    stochTool.description,
    stochTool.inputSchemaShape,
    wrapToolHandler(stochTool.name, (input) => stochTool.handler(input, apiKey))
  );
  server.tool(
    aroonTool.name,
    aroonTool.description,
    aroonTool.inputSchemaShape,
    wrapToolHandler(aroonTool.name, (input) => aroonTool.handler(input, apiKey))
  );

  console.log('Finished registering Alpha Vantage Technical Indicators tools.');
};
