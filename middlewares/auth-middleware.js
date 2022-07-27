const jwt = require("jsonwebtoken");
const UserModal = require("../models/User");

// Checking user authentication~
module.exports = checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      //  verify Token

      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //  console.log(userId)
      //    Get User From Token
      req.user = await UserModal.findById(userId).select('-password');
      // console.log(req.user)
      next();
    } catch (error) {
      console.log(error)
      res.status(401).send({
        status: "Failed",
        message: "Unauthorized user",
      });
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: "Failed", message: "Unauthorized User, No Token" });
  }
};
