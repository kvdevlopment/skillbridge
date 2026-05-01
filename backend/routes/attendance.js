const router = require('express').Router()
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

// Mark attendance
router.post('/mark', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { session_id, status } = req.body
    const user = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [req.clerkUserId]
    )
    const result = await pool.query(`
      INSERT INTO attendance (session_id, student_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (session_id, student_id) 
      DO UPDATE SET status = $3, marked_at = NOW()
      RETURNING *
    `, [session_id, user.rows[0].id, status])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router