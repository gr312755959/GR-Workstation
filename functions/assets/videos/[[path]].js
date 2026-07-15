function buildRangeHeaders(object, request) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=3600');

  const requestedRange = request.headers.get('range');
  if (requestedRange && object.range) {
    const offset = object.range.offset ?? 0;
    const length = object.range.length ?? object.size;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set('content-length', String(length));
  } else {
    headers.set('content-length', String(object.size));
  }

  return headers;
}

export async function onRequest(context) {
  const { request, env, params } = context;

  if (!env.MEDIA_BUCKET) {
    return new Response('Media storage is not connected.', { status: 503 });
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed.', {
      status: 405,
      headers: { allow: 'GET, HEAD' },
    });
  }

  const pathParts = Array.isArray(params.path) ? params.path : [params.path];
  const key = `videos/${pathParts.filter(Boolean).join('/')}`;
  const options = request.headers.has('range') ? { range: request.headers } : undefined;
  const object = request.method === 'HEAD'
    ? await env.MEDIA_BUCKET.head(key)
    : await env.MEDIA_BUCKET.get(key, options);

  if (!object) {
    return new Response('Media not found.', { status: 404 });
  }

  const headers = buildRangeHeaders(object, request);
  const status = request.headers.has('range') ? 206 : 200;
  return new Response(request.method === 'HEAD' ? null : object.body, { status, headers });
}

