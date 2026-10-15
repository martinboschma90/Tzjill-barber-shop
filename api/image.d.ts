import type { IncomingMessage, ServerResponse } from 'node:http'
export default function handler(req: IncomingMessage & { query?: Record<string, string> }, res: ServerResponse): Promise<void>
