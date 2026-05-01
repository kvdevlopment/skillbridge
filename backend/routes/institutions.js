const router = require('express').Router()
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')

router.get('/:id/summary', requireAuth, requireRole('programme_manager'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.name as batch_name,
        COUNT(DISTINCT bs.student_id) as students,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN a.status='present' THEN a.id END) as present_count
      FROM batches b
      LEFT JOIN batch_students bs ON bs.batch_id = b.id
      LEFT JOIN sessions s ON s.batch_id = b.id
      LEFT JOIN attendance a ON a.session_id = s.id
      WHERE b.institution_id = $1
      GROUP BY b.id, b.name
    `, [req.params.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router