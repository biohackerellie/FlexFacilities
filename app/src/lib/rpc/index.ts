import { RPC } from './rpc';

import { env } from '@/env';
import { createConnectTransport } from '@connectrpc/connect-web';

const base = new URL(env.API_HOST);
base.port = String(env.API_PORT);

const transport = createConnectTransport({ baseUrl: base.toString() });
export const client = new RPC(transport);
