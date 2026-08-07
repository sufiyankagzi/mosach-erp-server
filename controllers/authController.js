const db = require("../config/connectdb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


exports.login = async (req,res)=>{

    const {username,password}=req.body;


    const sql = `
        SELECT * FROM users 
        WHERE username = ?
    `;


    db.query(sql,[username], async (err,result)=>{

        if(err)
        {
            return res.status(500).json(err);
        }


        if(result.length === 0)
        {
            return res.status(401).json({
                message:"User not found"
            });
        }


        const user=result[0];


        // PASSWORD CHECK
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );


        if(!isMatch)
        {
            return res.status(401).json({
                message:"Invalid Password"
            });
        }



        // CREATE TOKEN
        const token = jwt.sign(
            {
                userid:user.userid,
                companyid:user.companyid,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );


        res.json({
            message:"Login Successful",
            token,
            user:{
                userid:user.userid,
                username:user.username,
                role:user.role,
                companyid:user.companyid
            }
        });


    });

};