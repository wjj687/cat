/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import { getOrCreateUser, extractDeviceContext } from '../../src/lib/auth.js';
import { 
  ApiError, 
  ValidationError, 
  UnauthorizedError,
  formatZodError,
  createErrorResponse 
} from '../../src/lib/errors.js';
import { logger } from '../../src/lib/logger.js';
import type { ApiResponse, DeviceContext } from '../../src/types/index.js';

// Import route handlers
import { handleRecognize } from './recognize.js';
import { handleDex, handleDexEntry } from './dex.js';
import { handleKnowledgeCard } from './knowledge.js';
import { handleCats, handleCatDetail } from './cats.js';
import { handleEncounters, handleEncounterDetail, handleCreateEncounter } from './encounters.js';
import { handleTimeline } from './timeline.js';
import { handleMatchSuggest, handleMatchResolve } from './matches.js';
import { handleUploadSign } from './uploads.js';
import { handleHealth } from './health.js';

// Request context with authenticated user
interface RequestContext {
  userId: string;
  deviceId: string;
  requestId: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-Id, X-Device-Fingerprint',
  'Access-Control-Max-Age': '86400',
};

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Parse request body
async function parseBody(event: HandlerEvent): Promise<unknown> {
  if (!event.body) return {};
  
  try {
    return JSON.parse(event.body);
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }
}

// Parse query parameters
function parseQueryParams(event: HandlerEvent): Record<string, string> {
  return event.queryStringParameters || {};
}

// Main handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '') || '/';
  const method = event.httpMethod;

  logger.request(method, path, { requestId });

  try {
    // Health check doesn't require auth
    if (path === '/health' && method === 'GET') {
      const result = await handleHealth();
      return sendResponse(result, 200, requestId, startTime);
    }

    // Authenticate request
    const deviceContext = extractDeviceContext(new Headers(event.headers as Record<string, string>));
    if (!deviceContext) {
      throw new UnauthorizedError('Missing device identification headers');
    }

    const userId = await getOrCreateUser(deviceContext);
    const reqContext: RequestContext = {
      userId,
      deviceId: deviceContext.deviceId,
      requestId,
    };

    // Parse request data
    const body = await parseBody(event);
    const query = parseQueryParams(event);
    const params = extractPathParams(path);

    // Route to appropriate handler
    const result = await routeRequest(method, path, { body, query, params, context: reqContext });
    
    return sendResponse(result, 200, requestId, startTime);

  } catch (error) {
    return handleError(error, requestId, startTime, method, path);
  }
};

// Route requests to handlers
async function routeRequest(
  method: string, 
  path: string, 
  options: {
    body: unknown;
    query: Record<string, string>;
    params: Record<string, string>;
    context: RequestContext;
  }
): Promise<unknown> {
  const { body, query, params, context } = options;

  // Recognition
  if (path === '/recognize' && method === 'POST') {
    return handleRecognize(body, context);
  }

  // Dex
  if (path === '/dex' && method === 'GET') {
    return handleDex(context);
  }
  if (path.startsWith('/dex/') && method === 'GET') {
    return handleDexEntry(params.id, context);
  }

  // Knowledge
  if (path.startsWith('/knowledge/') && method === 'GET') {
    return handleKnowledgeCard(params.id, context);
  }

  // Cats
  if (path === '/cats' && method === 'GET') {
    return handleCats(context);
  }
  if (path.startsWith('/cats/') && method === 'GET') {
    return handleCatDetail(params.id, context);
  }

  // Encounters
  if (path === '/encounters' && method === 'GET') {
    return handleEncounters(query, context);
  }
  if (path === '/encounters' && method === 'POST') {
    return handleCreateEncounter(body, context);
  }
  if (path.startsWith('/encounters/') && method === 'PATCH') {
    return handleEncounterDetail(params.id, body, context);
  }

  // Timeline
  if (path === '/timeline' && method === 'GET') {
    return handleTimeline(query, context);
  }

  // Matches
  if (path === '/matches/suggest' && method === 'POST') {
    return handleMatchSuggest(body, context);
  }
  if (path.startsWith('/matches/') && path.endsWith('/resolve') && method === 'POST') {
    return handleMatchResolve(params.id, body, context);
  }

  // Uploads
  if (path === '/uploads/sign' && method === 'POST') {
    return handleUploadSign(context);
  }

  throw new ApiError('NOT_FOUND', `Route ${method} ${path} not found`, 404);
}

// Extract path parameters from URL
function extractPathParams(path: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parts = path.split('/').filter(Boolean);
  
  // Simple pattern matching for /resource/:id patterns
  if (parts.length >= 2) {
    params.id = parts[1];
  }
  if (parts.length >= 4 && parts[2] === 'resolve') {
    params.id = parts[1];
  }
  
  return params;
}

// Send successful response
function sendResponse(data: unknown, statusCode: number, requestId: string, startTime: number) {
  const duration = Date.now() - startTime;
  
  const response: ApiResponse<unknown> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  logger.response('API', 'response', statusCode, duration, { requestId });

  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  };
}

// Handle errors
function handleError(error: unknown, requestId: string, startTime: number, method: string, path: string) {
  const duration = Date.now() - startTime;
  
  let statusCode = 500;
  
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    error = new ValidationError('Validation failed', formatZodError(error));
  }

  logger.response(method, path, statusCode, duration, { requestId });
  logger.error('Request failed', { requestId, statusCode }, error as Error);

  const errorResponse = createErrorResponse(error as Error, requestId);

  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorResponse),
  };
}
