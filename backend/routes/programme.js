const router = require('express').Router()
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

router.get('/summary', requireAuth, requireRole('programme_manager', 'monitoring_officer'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT u.id) FILTER (WHERE u.role='student') as total_students,
        COUNT(DISTINCT u.id) FILTER (WHERE u.role='trainer') as total_trainers,
        COUNT(DISTINCT b.id) as total_batches,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN a.status='present' THEN a.id END) as total_present,
        COUNT(DISTINCT a.id) as total_attendance_records
      FROM users u
      CROSS JOIN batches b
      CROSS JOIN sessions s
      LEFT JOIN attendance a ON a.session_id = s.id
    `)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router