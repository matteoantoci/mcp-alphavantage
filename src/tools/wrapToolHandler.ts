// Define a type that mirrors the expected ToolResponse structure based on error messages
// Adjusted the 'resource' type to make 'blob' a required string if present, based on the error.
import { getFromCache, setToCache } from '../cacheService.js';

// Define a type that mirrors the expected ToolResponse structure based on error messages
// Adjusted the 'resource' type to make 'blob' a required string if present, based on the error.
type McpContent =
  | { type: 'text'; text: string; [key: string]: unknown }
  | { type: 'image'; data: string; mimeType: string; [key: string]: unknown }
  | { type: 'audio'; data: string; mimeType: string; [key: string]: unknown }
  | {
      type: 'resource';
      resource: { uri: string; text?: string; blob: string; mimeType?: string; [key: string]: unknown };
      [key: string]: unknown;
    }; // Made 'blob' required string

type McpToolResponse = {
  content: McpContent[];
  isError?: boolean;
  _meta?: { [key: string]: unknown };
  [key: string]: unknown;
};

/**
 * Wraps a tool handler to standardize the output format for the MCP server and add caching.
 * The wrapped handler will return the result as pretty-printed JSON text
 * within the MCP content structure, using the cache if available.
 * @param toolName The name of the tool being wrapped.
 * @param handler The original tool handler function.
 * @returns A new handler function that wraps the original handler's result, returning an McpToolResponse.
 */
export const wrapToolHandler =
  (toolName: string, handler: (...args: any[]) => Promise<any>): ((...args: any[]) => Promise<McpToolResponse>) =>
  async (...args: any[]): Promise<McpToolResponse> => {
    const params = args[0]; // Assuming params is the first argument

    try {
      // Check cache first
      const cachedResult = getFromCache(toolName, params);
      if (cachedResult !== undefined) {
        console.log(`Cache hit for tool: ${toolName}`);
        return {
          content: [{ type: 'text', text: JSON.stringify(cachedResult, null, 2) }],
        };
      }

      console.log(`Cache miss for tool: ${toolName}. Executing handler.`);
      // Execute original handler if no cache hit
      const result = await handler(...args);

      // Store result in cache
      setToCache(toolName, params, result);
      console.log(`Result cached for tool: ${toolName}`);

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: any) {
      console.error('Error in wrapped tool handler:', error);
      // Return a standardized error response conforming to McpToolResponse
      return {
        content: [{ type: 'text', text: `Error executing tool: ${error.message || 'An unknown error occurred.'}` }],
        isError: true, // Indicate that this is an error response
        // Optionally, include error details in a structured way if the MCP server supports it
        // _meta: { error: { message: error.message || 'An unknown error occurred.', details: error.details || null } }
      };
    }
  };
