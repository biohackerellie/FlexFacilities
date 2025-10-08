import { createConnectTransport } from '@connectrpc/connect-web';

import { RPC } from './rpc';

const base = new URL(process.env.API_HOST ?? 'http://localhost');
base.port = String(process.env.API_PORT ?? 8080);

const transport = createConnectTransport({ baseUrl: base.toString() });
export const client = new RPC(transport);
