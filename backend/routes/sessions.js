const router = require('express').Router()
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

// Create session
router.post('/', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { batch_id, title, date, start_time, end_time } = req.body
    const user = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [req.clerkUserId]
    )
    const result = await pool.query(
      'INSERT INTO sessions (batch_id, trainer_id, title, date, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [batch_id, user.rows[0].id, title, date, start_time, end_time]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get session attendance (trainer)
router.get('/:id/attendance', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.name, u.id, 
        COALESCE(a.status, 'absent') as status,
        a.marked_at
      FROM batch_students bs
      JOIN sessions s ON s.batch_id = bs.batch_id
      JOIN users u ON u.id = bs.student_id
      LEFT JOIN attendance a ON a.session_id = s.id AND a.student_id = bs.student_id
      WHERE s.id = $1
    `, [req.params.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get active sessions for student
router.get('/active', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [req.clerkUserId]
    )
    const result = await pool.query(`
      SELECT s.* FROM sessions s
      JOIN batch_students bs ON bs.batch_id = s.batch_id
      WHERE bs.student_id = $1 AND s.date = CURRENT_DATE
    `, [user.rows[0].id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router