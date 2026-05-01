const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/users', require('./routes/users'))
app.use('/batches', require('./routes/batches'))
app.use('/sessions', require('./routes/sessions'))
app.use('/attendance', require('./routes/attendance'))
app.use('/institutions', require('./routes/institutions'))
app.use('/programme', require('./routes/programme'))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))