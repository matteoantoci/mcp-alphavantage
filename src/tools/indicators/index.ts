import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import type { AlphaVantageClient } from '../../alphaVantageClient.js';
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
 * @param client The Alpha Vantage client instance.
 */
export const registerIndicatorsTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Technical Indicators tools...');
  // Register individual tools
  server.tool(
    smaTool.name,
    smaTool.description,
    smaTool.inputSchemaShape,
    wrapToolHandler((input) => smaTool.handler(input, client))
  );
  server.tool(
    emaTool.name,
    emaTool.description,
    emaTool.inputSchemaShape,
    wrapToolHandler((input) => emaTool.handler(input, client))
  );
  server.tool(
    rsiTool.name,
    rsiTool.description,
    rsiTool.inputSchemaShape,
    wrapToolHandler((input) => rsiTool.handler(input, client))
  );
  server.tool(
    bbandsTool.name,
    bbandsTool.description,
    bbandsTool.inputSchemaShape,
    wrapToolHandler((input) => bbandsTool.handler(input, client))
  );
  server.tool(
    adxTool.name,
    adxTool.description,
    adxTool.inputSchemaShape,
    wrapToolHandler((input) => adxTool.handler(input, client))
  );
  server.tool(
    obvTool.name,
    obvTool.description,
    obvTool.inputSchemaShape,
    wrapToolHandler((input) => obvTool.handler(input, client))
  );
  server.tool(
    atrTool.name,
    atrTool.description,
    atrTool.inputSchemaShape,
    wrapToolHandler((input) => atrTool.handler(input, client))
  );
  server.tool(
    adTool.name,
    adTool.description,
    adTool.inputSchemaShape,
    wrapToolHandler((input) => adTool.handler(input, client))
  );
  server.tool(
    stochTool.name,
    stochTool.description,
    stochTool.inputSchemaShape,
    wrapToolHandler((input) => stochTool.handler(input, client))
  );
  server.tool(
    aroonTool.name,
    aroonTool.description,
    aroonTool.inputSchemaShape,
    wrapToolHandler((input) => aroonTool.handler(input, client))
  );

  console.log('Finished registering Alpha Vantage Technical Indicators tools.');
};
