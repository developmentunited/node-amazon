const app = require('../app.js');
const db = app.get('db');

module.exports = {
    getAllProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = 24;
        const brand = req.query.brand;
        const os = req.query.os;
        const ram = req.query.ram;
        const processor = req.query.processor;
        const storage = req.query.storage;

        db.get_all_products(brand, os, ram, processor, storage, (err, products) => {
            res.json({
                total: products.length,
                data: products.splice(offset, limit) //for pagination 
            });
        })
    },
    getProductById: (req, res, next) => {
        const id = parseInt(req.params.productId);
        req.session.data = {};

        db.get_product(id, (err, product) => {
            req.session.data.productInfo = product;
            next();
        })
    },

    getSimilarById: (req, res, next) => {
        const price = parseInt(req.session.data.productInfo[0].price);
        const id = parseInt(req.params.productId);

        db.get_similar_product(price, id, (err, product) => {
            res.json({
                product: req.session.data.productInfo,
                similar: product.splice(0, 3)
            });
        })
    },
    addToCart: (req, res, next) => {
        const id = parseInt(req.body.productId);
        const quantity = parseInt(req.body.productQuantity);

        if (!req.user) res.json({ userLog: false })
        else {
            db.cart.insert({ product_id: id, product_quantity: quantity, customer_id: req.user.id }, function (err, response) {
                res.json({
                    userLog: true
                })
            })
        }
    },
    getFromCart: (req, res, next) => {
        if (!req.user) res.json({ userLog: false })
        else {
            db.cart.find({customer_id: req.user.id}, function (err, response) {
                res.json({
                    userLog: true,
                    data: response
                })
            })
        }
    }
}

