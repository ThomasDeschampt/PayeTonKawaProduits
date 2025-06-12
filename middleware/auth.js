const jwt = require('jsonwebtoken');

const authorized = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Token invalide" });
    req.user = user;
    next();
  });
};

// Middleware qui vérifie aussi le rôle de l'utilisateur
const authorizedRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Token invalideeee" });
      }
      
      // Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: "Accès refusé : privilèges insuffisants" 
        });
      }
      
      req.user = user;
      next();
    });
  };
};

const adminOnly = authorizedRole(['Admin']);

module.exports = { authorized, authorizedRole, adminOnly };