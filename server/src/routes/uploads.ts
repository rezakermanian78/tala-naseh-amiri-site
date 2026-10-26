import { randomBytes } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import { fileTypeFromBuffer } from 'file-type'
import { AppError, notFound } from '../lib/errors.js'
import type { Ctx } from './context.js'

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

// Decided from the file's actual bytes, never from its name or the browser's claim.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
}
const FILE_NAME = /^[a-f0-9]{32}\.(jpg|png|webp|avif|pdf)$/

/** Public file serving at /uploads/:file (no auth). */
export async function uploadsPublic(app: FastifyInstance, { config }: Ctx) {
  const root = resolve(config.uploadDir)
  await mkdir(root, { recursive: true })
  await app.register(fastifyStatic, {
    root,
    prefix: '/uploads/',
    decorateReply: false,
    index: false,
    list: false,
    dotfiles: 'deny',
    // Names are random and never reused, so the files can be cached forever.
    setHeaders: (res) => {
      res.header('Cache-Control', 'public, max-age=31536000, immutable')
      res.header('X-Content-Type-Options', 'nosniff')
      res.header('Cross-Origin-Resource-Policy', 'cross-origin')
      res.header('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
    },
  })
}

/** Admin-only upload/delete (registered inside the authenticated scope). */
export async function uploadsAdmin(app: FastifyInstance, { config }: Ctx) {
  const root = resolve(config.uploadDir)
  await app.register(fastifyMultipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5, parts: 6 },
  })

  app.post('/api/admin/upload', { bodyLimit: MAX_UPLOAD_BYTES + 64 * 1024 }, async (req, reply) => {
    const part = await req.file()
    if (!part) throw new AppError(400, 'no_file', 'No file was uploaded.')
    let buf: Buffer
    try {
      buf = await part.toBuffer()
    } catch {
      throw new AppError(413, 'payload_too_large', 'The file is larger than 8 MB.')
    }
    const type = await fileTypeFromBuffer(buf)
    const ext = type && ALLOWED[type.mime]
    if (!type || !ext) {
      throw new AppError(415, 'unsupported_media_type', 'Only JPEG, PNG, WebP, AVIF images or PDF files are allowed.')
    }
    const file = `${randomBytes(16).toString('hex')}.${ext}`
    await writeFile(join(root, file), buf, { flag: 'wx' })
    const base = config.PUBLIC_URL?.replace(/\/+$/, '') ?? `${req.protocol}://${req.host}`
    return reply.status(201).send({ file, url: `${base}/uploads/${file}`, type: type.mime, size: buf.length })
  })

  app.delete('/api/admin/upload/:file', async (req, reply) => {
    const { file } = req.params as { file: string }
    if (!FILE_NAME.test(file)) throw new AppError(400, 'bad_request', 'Invalid file name.')
    try {
      await unlink(join(root, file))
    } catch {
      throw notFound('File')
    }
    return reply.status(204).send()
  })
}
