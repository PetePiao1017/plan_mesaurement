const db = require("../models");

const Measure = db.measures;

// Find a single user with an email
exports.save = (req, res) => {
    let successFlag = true;
    const dataToSave = req.body.slice(1);

    Measure.destroy({
        where:{},
        truncate: true
    })
    .then(data => {
        dataToSave.forEach(element => {
            const {area, subarea, category, subcategory, type, unit, measure,  result, price} = element;
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
            .catch(err => {
                successFlag = false;
            })
        })

        if(successFlag){
            res.status(200).send({
                respond: "success"
            })
        }
        else{
            res.status(201).send({
                msg: "Error occured while saving measured data to databse."
            })
        }
        
    }
    )
    // const {area, subarea, category, subcategory, type, unit, measure,  result, price} = req.body;
    // Measure.destroy({
    //     where: {},
    //     truncate: true
    //   })
    // .then(data => {
    //     Measure.create({
    //         area: area,
    //         subarea: subarea,
    //         category: category,
    //         subcategory: JSON.stringify(subcategory),
    //         type: type,
    //         unit: unit,
    //         measure: measure,
    //         HDP: 0,
    //         total: result,
    //         price: price,
    //     })
    //     .then(data => {
    //         res.status(200).send({
    //             data: "success"
    //         });
    //     })
    //     .catch(err => {
    //         res.status(500).send({
    //             message: err.message || "Some error occured while creating the measuring data."
    //         })
    //     })
    // })
    // 
};