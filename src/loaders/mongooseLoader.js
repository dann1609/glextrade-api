const mongoose = require('mongoose');

module.exports = {
    load: ()=>{
        return mongoose.connect('mongodb://localhost/glextrade')
            .then(()=>console.log('\n','Connected to MongoDB'))
            .catch(err =>console.error('\n','Could nor connect to MongoDB...', err))
    }
}