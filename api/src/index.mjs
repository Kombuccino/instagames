import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { Pool } from 'pg'

const PORT = Number(process.env.PORT || 3000)
const DATABASE_URL = process.env.DATABASE_URL?.trim()
const COOKIE_NAME = 'mf_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2
const COOKIE_SECURE = process.env.COOKIE_SECURE !== 'false'
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

if (!DATABASE_URL) throw new Error('DATABASE_URL is required')

const pool = new Pool({ connectionString: DATABASE_URL })

async function migrate() {
  const sql = await readFile(new URL('../migrations/001_init.sql', import.meta.url), 'utf8')
  await pool.query(sql)
}

function json(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  res.end(JSON.stringify(payload))
}

function parseCookies(header = '') {
  const result = {}
  for (const chunk of header.split(';')) {
    const index = chunk.indexOf('=')
    if (index < 0) continue
    const key = chunk.slice(0, index).trim()
    const value = chunk.slice(index + 1).trim()
    if (key) result[key] = decodeURIComponent(value)
  }
  return result
}

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}

function cookieHeader(identityId) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(identityId)}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (COOKIE_SECURE) parts.push('Secure')
  return parts.join('; ')
}

async function ensureIdentity(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  let identityId = validUuid(cookies[COOKIE_NAME]) ? cookies[COOKIE_NAME] : randomUUID()
  await pool.query(
    `INSERT INTO identities (id) VALUES ($1)
     ON CONFLICT (id) DO UPDATE SET last_seen_at = now()`,
    [identityId],
  )
  if (cookies[COOKIE_NAME] !== identityId) res.setHeader('Set-Cookie', cookieHeader(identityId))
  return identityId
}

function setCors(req, res) {
  const origin = req.headers.origin
  if (!origin) return true
  const allowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
  if (!allowed) return false
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  return true
}

async function readJson(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 64 * 1024) throw Object.assign(new Error('Payload too large'), { status: 413 })
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 })
  }
}

function cleanNickname(value) {
  return typeof value === 'string' ? value.trim().slice(0, 20) : ''
}

function cleanBody(value) {
  return typeof value === 'string' ? value.trim().slice(0, 500) : ''
}

function clampLimit(value, fallback = 10, max = 100) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.min(max, Math.floor(parsed)))
}

async function getStats(gameId, identityId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM game_plays WHERE game_id = $1) AS plays,
       (SELECT count(*)::int FROM game_loves WHERE game_id = $1) AS loves,
       (SELECT count(*)::int FROM comments WHERE game_id = $1 AND deleted_at IS NULL) AS comments,
       (SELECT count(*)::int FROM game_bookmarks WHERE game_id = $1) AS bookmarks,
       EXISTS(SELECT 1 FROM game_loves WHERE game_id = $1 AND identity_id = $2) AS loved,
       EXISTS(SELECT 1 FROM game_bookmarks WHERE game_id = $1 AND identity_id = $2) AS bookmarked`,
    [gameId, identityId],
  )
  return rows[0]
}

function boardWindow(boardId) {
  if (boardId === 'global') return { start: null, end: null, special: false }

  const dayMatch = /^day:(\d{4}-\d{2}-\d{2})$/.exec(boardId)
  if (dayMatch) {
    const start = new Date(`${dayMatch[1]}T00:00:00.000Z`)
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start.getTime() + 86_400_000)
      return { start, end, special: false }
    }
  }

  const weekMatch = /^week:(\d{4})-W(\d{2})$/.exec(boardId)
  if (weekMatch) {
    const year = Number(weekMatch[1])
    const week = Number(weekMatch[2])
    if (week >= 1 && week <= 53) {
      const jan4 = new Date(Date.UTC(year, 0, 4))
      const jan4Day = jan4.getUTCDay() || 7
      const start = new Date(jan4)
      start.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7)
      start.setUTCHours(0, 0, 0, 0)
      const end = new Date(start.getTime() + 7 * 86_400_000)
      return { start, end, special: false }
    }
  }

  return { start: null, end: null, special: true }
}

function utcDayId(date = new Date()) {
  return `day:${date.toISOString().slice(0, 10)}`
}

function isoWeekId(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = value.getUTCDay() || 7
  value.setUTCDate(value.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((value.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
  return `week:${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function responseBoardId(input) {
  if (typeof input.boardId === 'string' && input.boardId.trim()) return input.boardId.trim().slice(0, 80)
  if (Array.isArray(input.periods)) {
    if (input.periods.includes('daily')) return utcDayId()
    if (input.periods.includes('weekly')) return isoWeekId()
  }
  return 'global'
}

async function leaderboard(gameId, boardId, limit, sort) {
  const direction = sort === 'asc' ? 'ASC' : 'DESC'
  const window = boardWindow(boardId)
  const values = [gameId]
  let where = 'game_id = $1'

  if (window.special) {
    values.push(boardId)
    where += ` AND board_id = $${values.length}`
  } else if (window.start && window.end) {
    values.push(window.start.toISOString(), window.end.toISOString())
    where += ` AND created_at >= $${values.length - 1} AND created_at < $${values.length}`
  } else {
    where += ` AND (board_id IS NULL OR board_id = 'global')`
  }

  values.push(limit)
  const { rows } = await pool.query(
    `SELECT id, game_id, nickname, score, created_at
       FROM scores
      WHERE ${where}
      ORDER BY score ${direction}, created_at ASC
      LIMIT $${values.length}`,
    values,
  )

  return rows.map((row) => ({
    id: row.id,
    gameId: row.game_id,
    boardId,
    nickname: row.nickname,
    score: Number(row.score),
    createdAt: new Date(row.created_at).toISOString(),
  }))
}

async function profileFor(identityId) {
  const { rows } = await pool.query(
    `SELECT i.id, i.kind, p.handle, p.display_name, p.bio, p.avatar_url
       FROM identities i
       LEFT JOIN profiles p ON p.identity_id = i.id
      WHERE i.id = $1`,
    [identityId],
  )
  const row = rows[0]
  return {
    id: row.id,
    kind: row.kind,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
  }
}

async function handler(req, res) {
  if (!setCors(req, res)) return json(res, 403, { error: 'origin_not_allowed' })
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (req.method === 'GET' && url.pathname === '/health') {
    const result = await pool.query('SELECT 1 AS ok')
    return json(res, 200, { ok: result.rows[0]?.ok === 1 })
  }

  if (!url.pathname.startsWith('/v1/')) return json(res, 404, { error: 'not_found' })
  const identityId = await ensureIdentity(req, res)

  if (req.method === 'GET' && url.pathname === '/v1/me') {
    const profile = await profileFor(identityId)
    const bookmarks = await pool.query(
      `SELECT game_id, created_at FROM game_bookmarks WHERE identity_id = $1 ORDER BY created_at DESC`,
      [identityId],
    )
    return json(res, 200, {
      ...profile,
      bookmarks: bookmarks.rows.map((row) => ({ gameId: row.game_id, createdAt: new Date(row.created_at).toISOString() })),
    })
  }

  if (req.method === 'PUT' && url.pathname === '/v1/me/profile') {
    const body = await readJson(req)
    const handle = typeof body.handle === 'string' ? body.handle.trim().toLowerCase().slice(0, 30) : null
    if (handle && !/^[a-z0-9_]{3,30}$/.test(handle)) return json(res, 400, { error: 'invalid_handle' })
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 50) : null
    const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 280) : null
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim().slice(0, 500) : null
    try {
      await pool.query(
        `INSERT INTO profiles (identity_id, handle, display_name, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (identity_id) DO UPDATE SET
           handle = EXCLUDED.handle,
           display_name = EXCLUDED.display_name,
           bio = EXCLUDED.bio,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = now()`,
        [identityId, handle, displayName, bio, avatarUrl],
      )
    } catch (error) {
      if (error?.code === '23505') return json(res, 409, { error: 'handle_taken' })
      throw error
    }
    return json(res, 200, await profileFor(identityId))
  }

  const statsMatch = /^\/v1\/games\/([^/]+)\/stats$/.exec(url.pathname)
  if (req.method === 'GET' && statsMatch) {
    const gameId = decodeURIComponent(statsMatch[1])
    return json(res, 200, await getStats(gameId, identityId))
  }

  const playsMatch = /^\/v1\/games\/([^/]+)\/plays$/.exec(url.pathname)
  if (req.method === 'POST' && playsMatch) {
    const gameId = decodeURIComponent(playsMatch[1])
    await pool.query(
      `INSERT INTO game_plays (id, game_id, identity_id) VALUES ($1, $2, $3)`,
      [randomUUID(), gameId, identityId],
    )
    return json(res, 200, await getStats(gameId, identityId))
  }

  const flagMatch = /^\/v1\/games\/([^/]+)\/(love|bookmark)$/.exec(url.pathname)
  if (flagMatch && (req.method === 'PUT' || req.method === 'DELETE')) {
    const gameId = decodeURIComponent(flagMatch[1])
    const table = flagMatch[2] === 'love' ? 'game_loves' : 'game_bookmarks'
    if (req.method === 'PUT') {
      await pool.query(
        `INSERT INTO ${table} (game_id, identity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [gameId, identityId],
      )
    } else {
      await pool.query(`DELETE FROM ${table} WHERE game_id = $1 AND identity_id = $2`, [gameId, identityId])
    }
    return json(res, 200, await getStats(gameId, identityId))
  }

  const commentsMatch = /^\/v1\/games\/([^/]+)\/comments$/.exec(url.pathname)
  if (commentsMatch && req.method === 'GET') {
    const gameId = decodeURIComponent(commentsMatch[1])
    const limit = clampLimit(url.searchParams.get('limit'), 50, 100)
    const { rows } = await pool.query(
      `SELECT id, game_id, nickname, body, created_at
         FROM comments
        WHERE game_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $2`,
      [gameId, limit],
    )
    return json(res, 200, rows.map((row) => ({
      id: row.id,
      gameId: row.game_id,
      nickname: row.nickname,
      body: row.body,
      createdAt: new Date(row.created_at).toISOString(),
    })))
  }

  if (commentsMatch && req.method === 'POST') {
    const gameId = decodeURIComponent(commentsMatch[1])
    const body = await readJson(req)
    const nickname = cleanNickname(body.nickname)
    const commentBody = cleanBody(body.body)
    if (!nickname || !commentBody) return json(res, 400, { error: 'invalid_comment' })
    const id = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO comments (id, game_id, identity_id, nickname, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, game_id, nickname, body, created_at`,
      [id, gameId, identityId, nickname, commentBody],
    )
    const row = rows[0]
    return json(res, 201, {
      id: row.id,
      gameId: row.game_id,
      nickname: row.nickname,
      body: row.body,
      createdAt: new Date(row.created_at).toISOString(),
    })
  }

  if (req.method === 'POST' && url.pathname === '/v1/scores') {
    const body = await readJson(req)
    const gameId = typeof body.gameId === 'string' ? body.gameId.trim().slice(0, 100) : ''
    const nickname = cleanNickname(body.nickname)
    const score = Number(body.score)
    if (!gameId || !nickname || !Number.isFinite(score)) return json(res, 400, { error: 'invalid_score' })
    const boardId = typeof body.boardId === 'string' && body.boardId.trim() ? body.boardId.trim().slice(0, 80) : null
    const runId = typeof body.runId === 'string' && body.runId.trim() ? body.runId.trim().slice(0, 120) : null
    const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {}
    const id = randomUUID()
    try {
      const { rows } = await pool.query(
        `INSERT INTO scores (id, game_id, identity_id, nickname, score, board_id, run_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         RETURNING id, game_id, nickname, score, created_at`,
        [id, gameId, identityId, nickname, score, boardId, runId, JSON.stringify(metadata)],
      )
      const row = rows[0]
      return json(res, 201, {
        id: row.id,
        gameId: row.game_id,
        boardId: responseBoardId(body),
        nickname: row.nickname,
        score: Number(row.score),
        createdAt: new Date(row.created_at).toISOString(),
      })
    } catch (error) {
      if (error?.code === '23505' && runId) return json(res, 409, { error: 'run_already_submitted' })
      throw error
    }
  }

  const leaderboardMatch = /^\/v1\/leaderboards\/([^/]+)\/([^/]+)$/.exec(url.pathname)
  if (leaderboardMatch && req.method === 'GET') {
    const gameId = decodeURIComponent(leaderboardMatch[1])
    const boardId = decodeURIComponent(leaderboardMatch[2])
    const limit = clampLimit(url.searchParams.get('limit'), 10, 100)
    const sort = url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc'
    return json(res, 200, await leaderboard(gameId, boardId, limit, sort))
  }

  if (leaderboardMatch && req.method === 'POST') {
    const gameId = decodeURIComponent(leaderboardMatch[1])
    const boardId = decodeURIComponent(leaderboardMatch[2])
    const body = await readJson(req)
    const nickname = cleanNickname(body.nickname)
    const score = Number(body.score)
    if (!nickname || !Number.isFinite(score)) return json(res, 400, { error: 'invalid_score' })
    const id = randomUUID()
    const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {}
    const { rows } = await pool.query(
      `INSERT INTO scores (id, game_id, identity_id, nickname, score, board_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, game_id, nickname, score, created_at`,
      [id, gameId, identityId, nickname, score, boardId, JSON.stringify(metadata)],
    )
    const row = rows[0]
    return json(res, 201, {
      id: row.id,
      gameId: row.game_id,
      boardId,
      nickname: row.nickname,
      score: Number(row.score),
      createdAt: new Date(row.created_at).toISOString(),
    })
  }

  return json(res, 404, { error: 'not_found' })
}

await migrate()

const server = http.createServer((req, res) => {
  handler(req, res).catch((error) => {
    console.error(error)
    if (!res.headersSent) json(res, error?.status || 500, { error: 'internal_error' })
    else res.end()
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MiniFugg API listening on :${PORT}`)
})

async function shutdown(signal) {
  console.log(`${signal}: shutting down`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
