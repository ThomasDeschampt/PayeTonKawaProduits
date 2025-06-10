const { param, validationResult } = require('express-validator');

// Middleware de validation UUID
const validateUUID = [
  param('uuid')
    .isUUID()
    .withMessage('L\'identifiant fourni n\'est pas un UUID valide'),

  // Middleware pour vérifier les erreurs
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateUUID;
