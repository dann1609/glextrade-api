const { Router, Request, Response } = require('express');
const {User,validateUser} = require('../../models/user');
const { Company, validateCompany } = require('../../models/company');
const route = Router();

module.exports = (app) =>{
    app.use('/users',route)

    const registrer = async (req,res)=>{
        try {
            const queryObject = {
                ...req.body,
                domain: (req.body.email||'').split('@')[1]
            };
            const {error:errorUser} = validateUser(queryObject);
            const {error:errorCompany} = validateCompany(queryObject);
            const error = errorUser ||errorCompany;

            if (error) {
                return res.status(400).send(error.details[0].message);
            }

            let company = await Company.findOne({domain:queryObject.domain});

            if(company){
                return res.status(400).send('Company already registered')
            }

            let user = await User.findOne({email: queryObject.email});

            if (user) {
                return res.status(400).send('User already registered.')
            }

            user = new User(queryObject);

            company = new Company(queryObject);

            await user.save();

            await company.save();

            res.send(user);

        }catch (e) {
            console.error(e)
            return res.status(400).send('Unexpected error')
        }
    };

    route.post('/',registrer);
};