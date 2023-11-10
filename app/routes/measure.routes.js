module.exports = app => {
    const measrure = require("../controllers/measure.controller.js");
  
    var router = require("express").Router();
  
  
    // Retrieve all Tutorials
    // router.get("/", measrure.findAll);
  
    // Create New Category
    // router.put("/", measrure.createCategory);
  
    // Update one item in Category
    // router.post("/:id", measrure.updateCategory);
  
    // Delete a Tutorial with id
    // router.delete("/:id", measrure.deleteCategory);

    router.put("/", measrure.save);
  
  
    app.use('/api/measure', router);
  };
  