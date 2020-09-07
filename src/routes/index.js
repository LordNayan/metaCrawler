const express = require("express");
const router = express.Router();
/* GET home page. */
router.get('/', (req, res)=> {
    let resData = {
        status: 404,
        message: 'Data not found'
    };
    res.send(resData);
});

module.exports = router;