import type { NextApiRequest, NextApiResponse } from 'next';

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * CORS middleware
 */
export function withCors(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set specific origin
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

/**
 * Error handling middleware
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', error);

      // Don't send response if already sent
      if (res.headersSent) {
        return;
      }

      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';

      res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
        }),
      });
    }
  };
}

/**
 * Method validation middleware
 */
export function withMethods(methods: string[], handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!methods.includes(req.method || '')) {
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
        allowedMethods: methods,
      });
    }

    return handler(req, res);
  };
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const key = `${ip}`;
      const now = Date.now();

      const rateLimit = rateLimitMap.get(key);

      if (!rateLimit || now > rateLimit.resetTime) {
        rateLimitMap.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
      } else {
        rateLimit.count++;

        if (rateLimit.count > maxRequests) {
          return res.status(429).json({
            success: false,
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000),
          });
        }
      }

      return handler(req, res);
    };
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: ((handler: ApiHandler) => ApiHandler)[]): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Standard API wrapper with common middleware
 */
export function withApi(handler: ApiHandler): ApiHandler {
  return compose(
    withCors,
    withErrorHandler,
    withRateLimit(100, 60000)
  )(handler);
}