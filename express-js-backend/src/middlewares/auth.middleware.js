const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Attempt to verify as standard JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Falback: Check if it's the old PHP style token (base64 encoded json)
    // This allows transition or mixed usage if necessary, though ideally we switch to JWT fully.
    try {
        const buff = Buffer.from(token, 'base64');
        const decodedLegacy = JSON.parse(buff.toString('utf-8'));
        if (decodedLegacy && decodedLegacy.id) {
            req.user = decodedLegacy;
            return next();
        }
    } catch (e) {
        // ignore legacy error
    }

    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
