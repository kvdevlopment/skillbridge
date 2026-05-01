const { clerkClient } = require('@clerk/clerk-sdk-node')

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'No token' })

    const token = authHeader.replace('Bearer ', '')
    const payload = await clerkClient.verifyToken(token)
    
    const user = await clerkClient.users.getUser(payload.sub)
    req.clerkUser = user
    req.clerkUserId = user.id
    req.userRole = user.publicMetadata?.role
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }