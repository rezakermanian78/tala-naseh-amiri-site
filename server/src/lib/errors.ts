import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, type ZodType } from 'zod'

/** An error that is safe to show to the client as-is. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

export const notFound = (what = 'Resource') => new AppError(404, 'not_found', `${what} not found.`)

/** Parses with zod; turns failures into a 400 with a readable message. */
export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  throw validationError(result.error)
}

function validationError(err: ZodError) {
  const first = err.issues[0]
  const where = first?.path.length ? `${first.path.join('.')}: ` : ''
  return new AppError(400, 'validation_error', `${where}${first?.message ?? 'Invalid input'}`)
}

const codeForStatus: Record<number, string> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  405: 'method_not_allowed',
  406: 'not_acceptable',
  413: 'payload_too_large',
  415: 'unsupported_media_type',
  429: 'rate_limited',
}

/** Every error leaves the API as { error: { code, message } }; 5xx details stay in the logs. */
export function errorHandler(
  err: Error & { statusCode?: number },
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (err instanceof ZodError) err = validationError(err)
  const status = err instanceof AppError ? err.statusCode : (err.statusCode ?? 500)
  if (status >= 500) {
    req.log.error({ err }, 'request failed')
    return reply.status(status).send({ error: { code: 'internal_error', message: 'Something went wrong.' } })
  }
  const code = err instanceof AppError ? err.code : (codeForStatus[status] ?? 'bad_request')
  return reply.status(status).send({ error: { code, message: err.message } })
}
