const Product = require('../models/product')


const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({})
    res.status(200).json({ nbHits:products.length , products })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}

    if(featured) {
        queryObject.featured = featured === 'true' ? true: false
    }
    if(company) {
        queryObject.company = company
    }
    if(name) {
        queryObject.name = { $regex: name, $options: 'i' }
    }
    if(numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '<': '$lt',
            '=': '$eq',
            '>=': '$gte',
            '<=': '$lte'
        }

        //this is a pattern to search for. I personally think there is meant to be only one less than(<) but there were two in the tutorial so i pust two there
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(
            regEx,
            (match)=> `-${operatorMap[match]}-`
        )
        
        const options = ['price','rating']
        filters.split(',').forEach(item => {
            const [ field, operator, value ] = item.split('-')
            if(options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) }
            }
        })
    }

    let result = Product.find(queryObject)
    //sorting data accordingly
    if(sort) {
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    }else {
        result = result.sort('createdAt')
    }
    //query projection or selecting specific data
    if(fields){
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }


    //pagination setting
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    //specifies the number of values to skip
    const skip = (page -1) * limit

    result = result.skip(skip).limit(limit)

    const products = await result

    res.status(200).json({nbHits: products.length, products })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}