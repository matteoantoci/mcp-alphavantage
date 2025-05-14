import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import type { AlphaVantageClient } from '../../alphaVantageClient.js';
// Import individual tool definitions for intelligence
import { newsSentimentTool } from './newsSentiment.js';
import { earningsCallTranscriptTool } from './earningsCallTranscript.js';
import { topGainersLosersTool } from './topGainersLosers.js';
import { insiderTransactionsTool } from './insiderTransactions.js';
import { analyticsFixedWindowTool } from './analyticsFixedWindow.js';
import { analyticsSlidingWindowTool } from './analyticsSlidingWindow.js';

/**
 * Registers all Alpha Vantage Intelligence tools with the MCP server.
 * @param server The McpServer instance.
 * @param client The Alpha Vantage client instance.
 */
export const registerIntelligenceTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Intelligence tools...');
  // Register individual tools
  server.tool(
    newsSentimentTool.name,
    newsSentimentTool.description,
    newsSentimentTool.inputSchemaShape,
    wrapToolHandler((input) => newsSentimentTool.handler(input, client))
  );
  server.tool(
    earningsCallTranscriptTool.name,
    earningsCallTranscriptTool.description,
    earningsCallTranscriptTool.inputSchemaShape,
    wrapToolHandler((input) => earningsCallTranscriptTool.handler(input, client))
  );
  // topGainersLosersTool has an empty input schema, so its handler does not expect 'input'
  server.tool(
    topGainersLosersTool.name,
    topGainersLosersTool.description,
    topGainersLosersTool.inputSchemaShape,
    wrapToolHandler(() => topGainersLosersTool.handler(client))
  );
  server.tool(
    insiderTransactionsTool.name,
    insiderTransactionsTool.description,
    insiderTransactionsTool.inputSchemaShape,
    wrapToolHandler((input) => insiderTransactionsTool.handler(input, client))
  );
  server.tool(
    analyticsFixedWindowTool.name,
    analyticsFixedWindowTool.description,
    analyticsFixedWindowTool.inputSchemaShape,
    wrapToolHandler((input) => analyticsFixedWindowTool.handler(input, client))
  );
  server.tool(
    analyticsSlidingWindowTool.name,
    analyticsSlidingWindowTool.description,
    analyticsSlidingWindowTool.inputSchemaShape,
    wrapToolHandler((input) => analyticsSlidingWindowTool.handler(input, client))
  );

  console.log('Finished registering Alpha Vantage Intelligence tools.');
};
