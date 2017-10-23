const express = require('express');
const router = express.Router();
const swaggerJSDoc = require('swagger-jsdoc');

router.get('/doc', (req, res) => {
  let options = {
    swaggerDefinition: {
      info: {
        title: 'cute boy', // Title (required)
        version: '1.0.0' // Version (required)
      }
    },
    apis: ['./routes/doc.js'] // Path to the API docs
  }

  // Initialize swagger-jsdoc -> returns validated swagger spec in json format
  let swaggerSpec = swaggerJSDoc(options)
  res.send(swaggerSpec)
});

module.exports = router;
