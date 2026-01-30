const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {

  // Extract the JWT token from request headers
  const token = req.headers.token;
  console.log("token : ", token)

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (error, result) => {
    if (error) {

      return res.status(401).json({ message: error });

    } else {
      /** Next Route */
      next()
    }
  });



};


module.exports = { authentication }