import { NextResponse } from 'next/server'

const S3_ENDPOINT =
  process.env.S3_ENDPOINT ??
  'https://objectstorage.ap-chuncheon-1.oraclecloud.com/p/MGoMTri-Fp0xs4HYW6gTTe1rAJrL2x4E0jw-wGtpMex5tYXvfzVlGKudz44VNP_A/n/ax0ym4amgnfk/b/bucket-20261002-1841/o/'

export async function GET(request, { params }) {
  const { path = [] } = params ?? {}
  const key = path.join('/')

  if (!key) {
    return NextResponse.json({ error: 'Missing object key' }, { status: 400 })
  }

  const url = S3_ENDPOINT.endsWith('/')
    ? S3_ENDPOINT + key
    : S3_ENDPOINT + '/' + key

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json(
      { error: `Object not found (${res.status})` },
      { status: res.status }
    )
  }

  const arrayBuffer = await res.arrayBuffer()
  const contentType =
    res.headers.get('content-type') ?? 'application/octet-stream'

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(arrayBuffer.byteLength),
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
