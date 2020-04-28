const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const companySchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please enter company name'],
        minlength:1,
        maxlength:255
    },
    domain:{
        type: String,
        required:[true, 'Please enter company domain'],
        minlength:1,
        maxlength:255
    },
    country:{
    },
    sector:{
    }
});

const Company = mongoose.model('Company', companySchema);

function validateCompany(company){
    const schema = Joi.object({
        name:Joi.string().min(1).max(255).required(),
        domain:Joi.string().min(1).max(255).required()
    }).unknown(true);

    return schema.validate(company);
}

module.exports.Company = Company;
module.exports.validateCompany = validateCompany;