const db = require("../models");

const Measure = db.measures;

// Find a single user with an email
exports.save = (req, res) => {

    console.log(req.body);

    const {area, subarea, category, subcategory, type, unit, measure,  result, price} = req.body;
    Measure.destroy({
        where: {},
        truncate: true
      })
    // Measure.create({
    //     area: area,
    //     subarea: subarea,
    //     category: category,
    //     subcategory: JSON.stringify(subcategory),
    //     type: type,
    //     unit: unit,
    //     measure: measure,
    //     HDP: 0,
    //     total: result,
    //     price: price,
    // })
    .then(data => {
        Measure.create({
            area: area,
            subarea: subarea,
            category: category,
            subcategory: JSON.stringify(subcategory),
            type: type,
            unit: unit,
            measure: measure,
            HDP: 0,
            total: result,
            price: price,
        })
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occured while creating the measuring data."
            })
        })
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting the measuring data."
        })
    })
};