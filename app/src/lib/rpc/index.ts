import {RPC} from './rpc'

import { env } from '@/env'
import type { Transport } from '@connectrpc/connect'
import {createConnectTransport} from '@connectrpc/connect-web'

const getRPCClient = (transport: Transport) => {
  let instance: RPC | null = null;
  if (!instance) {
    instance = new RPC(transport);
  }
  return instance
}

const Client = (url: string, port?: number) => {
  const baseUrl = (() => {
    const base = new URL(url)
    if (port) base.port = String(port);
    return base.toString();
  })();
  const transport = createConnectTransport({
    baseUrl,
  })
  return getRPCClient(transport)
}

const url = env.HOST ?? 'http://0.0.0.0'
const port = env.PORT ?? 8080

export const client = Client(url, port)
