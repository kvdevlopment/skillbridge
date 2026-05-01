const router = require('express').Router()
const pool = require('../db')
const { requireAuth } = require('../middleware/auth')

// Sync user to DB after signup
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { name } = req.body
    const { clerkUserId, userRole } = req

    const existing = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [clerkUserId]
    )

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0])
    }

    const result = await pool.query(
      'INSERT INTO users (clerk_user_id, name, role) VALUES ($1, $2, $3) RETURNING *',
      [clerkUserId, name, userRole]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE clerk_user_id = $1', [req.clerkUserId]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router