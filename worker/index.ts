import { RoomDO } from './RoomDO';

interface Env {
  ROOM: DurableObjectNamespace;
  ASSETS: Fetcher;
}

const generateRoomCode = (length = 6): string => {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => (b % 10).toString()).join('');
};

const isValidRoomCode = (code: string): boolean =>
  /^\d{4,8}$/.test(code);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      let code = url.searchParams.get('room') ?? '';
      if (!code || code === 'NEW') {
        code = generateRoomCode();
      }
      if (!isValidRoomCode(code)) {
        return new Response('Invalid room code', { status: 400 });
      }
      const id = env.ROOM.idFromName(code);
      const stub = env.ROOM.get(id);
      const upstreamUrl = new URL(request.url);
      upstreamUrl.searchParams.set('room', code);
      const upstreamReq = new Request(upstreamUrl.toString(), request);
      return stub.fetch(upstreamReq);
    }

    if (url.pathname === '/healthz') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }

    // 静的アセット配信（dist/）。SPAフォールバック有
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

export { RoomDO };
