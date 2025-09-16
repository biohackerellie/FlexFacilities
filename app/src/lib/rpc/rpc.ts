import type { DescService } from '@bufbuild/protobuf';
import {
  type Client,
  ConnectError,
  createClient,
  type Transport,
} from '@connectrpc/connect';
import {
  Auth,
  FacilitiesService,
  ReservationService,
  UsersService,
} from './proto';

export class RPC {
  constructor(private transport: Transport) {}
  private cache = new WeakMap<DescService, any>();

  private getWrapped<T extends DescService>(
    service: T,
  ): WrappedClient<Client<T>> {
    const cached = this.cache.get(service) as
      | WrappedClient<Client<T>>
      | undefined;
    if (cached) return cached;
    const client = createClient(service, this.transport);
    const wrapped = wrapClient(client) as WrappedClient<Client<T>>;
    this.cache.set(service, wrapped);
    return wrapped;
  }

  auth() {
    return this.getWrapped(Auth);
  }

  facilities() {
    return this.getWrapped(FacilitiesService);
  }

  users() {
    return this.getWrapped(UsersService);
  }

  reservations() {
    return this.getWrapped(ReservationService);
  }
}

export class RPCResponse<T> {
  constructor(
    public data: T | null,
    public error: ConnectError | null,
  ) {}
  isSuccess(): boolean {
    return this.error === null;
  }
  isError(): boolean {
    return this.error !== null;
  }
}

type PromiseLikeR<T> = {
  then: (onFulfilled: (v: T) => any, onRejected?: (e: any) => any) => any;
};
const isPromiseLike = (v: unknown): v is PromiseLikeR<unknown> =>
  !!v && typeof (v as any).then === 'function';

function normalizeConnectError(e: unknown): ConnectError {
  return e instanceof ConnectError ? e : ConnectError.from(e);
}

type WrapMethod<M> = M extends (...a: infer A) => Promise<infer R>
  ? (...a: A) => Promise<RPCResponse<R>>
  : M;

export type WrappedClient<C> = { [K in keyof C]: WrapMethod<C[K]> };

function wrapClient<C extends object>(client: C): WrappedClient<C> {
  const out: any = Object.create(Object.getPrototypeOf(client));
  for (const key of Object.keys(client) as (keyof C)[]) {
    const value = (client as any)[key];
    if (typeof value !== 'function') {
      out[key] = value;
      continue;
    }
    const fn = value.bind(client);
    out[key] = (...args: any[]) => {
      const result = fn(...args);
      if (isPromiseLike(result)) {
        return (result as Promise<any>)
          .then((data) => new RPCResponse(data, null))
          .catch((e) => new RPCResponse(null, normalizeConnectError(e)));
      }
      return result;
    };
  }
  return out;
}
