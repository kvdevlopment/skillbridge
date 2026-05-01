const router = require('express').Router()
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')
const crypto = require('crypto')

// Create batch
router.post('/', requireAuth, requireRole('trainer', 'institution'), async (req, res) => {
  try {
    const { name, institution_id } = req.body
    const result = await pool.query(
      'INSERT INTO batches (name, institution_id) VALUES ($1, $2) RETURNING *',
      [name, institution_id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Generate invite link
router.post('/:id/invite', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex')
    await pool.query(
      'UPDATE batches SET invite_token = $1 WHERE id = $2',
      [token, req.params.id]
    )
    res.json({ 
      invite_link: `${process.env.FRONTEND_URL}/join?token=${token}` 
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Join batch via invite
router.post('/:id/join', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { token } = req.body
    const batch = await pool.query(
      'SELECT * FROM batches WHERE invite_token = $1 AND id = $2',
      [token, req.params.id]
    )
    if (batch.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid invite' })
    }

    const user = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [req.clerkUserId]
    )

    await pool.query(
      'INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, user.rows[0].id]
    )
    res.json({ message: 'Joined batch!' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get batch summary (institution)
router.get('/:id/summary', requireAuth, requireRole('institution', 'programme_manager'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.title, s.date,
        COUNT(DISTINCT bs.student_id) as total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.student_id END) as present,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.student_id END) as absent
      FROM sessions s
      LEFT JOIN batch_students bs ON bs.batch_id = s.batch_id
      LEFT JOIN attendance a ON a.session_id = s.id
      WHERE s.batch_id = $1
      GROUP BY s.id, s.title, s.date
    `, [req.params.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router