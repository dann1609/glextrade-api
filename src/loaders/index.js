const expressLoader = require('./expressLoader')
const mongooseLoader = require('./mongooseLoader')

module.exports = {
load: async (app)=>{
    console.log('loading loaders')

    const mongoConnection = await mongooseLoader.load();

    expressLoader.load(app)
}
}