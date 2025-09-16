import { createConnectTransport } from '@connectrpc/connect-web';

import { env } from '@/env';
import { RPC } from './rpc';

const base = new URL(env.API_HOST);
base.port = String(env.API_PORT);

const transport = createConnectTransport({ baseUrl: base.toString() });
export const client = new RPC(transport);
