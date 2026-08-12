const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;

// const jwt = require("jsonwebtoken");


// const authMiddleware = (req,res,next)=>{

//     try {

//         const token = req.headers.authorization?.split(" ")[1];


//         if(!token)
//         {
//             return res.status(401).json({
//                 message:"No Token Provided"
//             });
//         }


//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );


//         req.user = decoded;


//         next();


//     } catch(error){

//         return res.status(401).json({
//             message:"Invalid Token"
//         });

//     }

// };


// module.exports = authMiddleware;