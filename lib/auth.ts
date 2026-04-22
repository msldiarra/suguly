import { createHmac } from 'crypto'

const SECRET = process.env.JWT_SECRET || 'suguly-super-secret-key-2026'

// Simple token generator (not a full JWT, but good enough for MVP)
export function signToken(payload: object, expiresInDays: number = 30): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payloadBase64 = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  })).toString('base64url')
  
  const signature = createHmac('sha256', SECRET)
    .update(`${header}.${payloadBase64}`)
    .digest('base64url')
    
  return `${header}.${payloadBase64}.${signature}`
}

export function verifyToken(token: string): any | null {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    
    const expectedSignature = createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url')
      
    if (signature !== expectedSignature) return null
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    
    if (decodedPayload.exp && Date.now() > decodedPayload.exp) {
      return null // Expired
    }
    
    return decodedPayload
  } catch (error) {
    return null
  }
}
