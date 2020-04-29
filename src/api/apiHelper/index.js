
const ApiHelper = {
    status400Error: (res,error)=>{
     return res.status(400).send({
         error
     }   );
    }
};

module.exports = ApiHelper;