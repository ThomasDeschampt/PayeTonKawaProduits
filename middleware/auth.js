const jwt = require('jsonwebtoken');

const authorized = (req, res, next) => {
    console.log('Checking authorization...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) {
      console.log('No token provided');
      return res.sendStatus(401);
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log('Invalid token');
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  };  

module.exports = authorized;
