const express = require('express')
const app = express()
const connectDB = require('./db/connect')
//direct imports
require('dotenv/config')
require('express-async-errors')

const notFound = require('./middleware/not-found')
const errorHandler = require('./middleware/error-handler')
const productsRouter = require('./routes/products')

app.get('/', (req,res) => {
    res.send('Working')
})

app.use('/api/v1/products', productsRouter)

//middleware
app.use(errorHandler)
app.use(notFound)

const start = async () => {
    try{
        const url = process.env.DB_CONNECT
        await connectDB(url)

        const port = process.env.PORT || 5000

        app.listen(port, () => {
            console.log(`Server is listening on port ${ port }...`)
        })
    }catch(err) {
        console.log(err)
    }
}

start()