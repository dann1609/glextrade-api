const expressLoader = require('./expressLoader')

module.exports = {
load: (app)=>{
    console.log('loading loaders')
    expressLoader.load(app)
}
}