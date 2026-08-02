const Company = require("../models/companyModel");


// GET ALL

exports.getCompanies=(req,res)=>{


    Company.getAllCompanies((err,result)=>{

        if(err)
        {
            return res.status(500).json(err);
        }


        res.json(result);

    });


};



// GET BY ID

exports.getCompany=(req,res)=>{


    Company.getCompanyById(req.params.id,(err,result)=>{
        if(err)
        {
            return res.status(500).json(err);
        }


        res.json(result[0]);

    });


};




// CREATE

exports.addCompany=(req,res)=>{


    Company.createCompany(req.body,(err,result)=>{


        if(err)
        {
            return res.status(500).json(err);
        }


        res.json({
            message:"Company Added Successfully",
            id:result.insertId
        });


    });


};





// UPDATE

exports.editCompany=(req,res)=>{


    Company.updateCompany(
        req.params.id,
        req.body,
        (err,result)=>{


            if(err)
            {
                return res.status(500).json(err);
            }


            res.json({
                message:"Company Updated Successfully"
            });


        }
    );


};




// DELETE

exports.removeCompany=(req,res)=>{


    Company.deleteCompany(req.params.id,(err,result)=>{


        if(err)
        {
            return res.status(500).json(err);
        }


        res.json({
            message:"Company Deleted Successfully"
        });


    });


};