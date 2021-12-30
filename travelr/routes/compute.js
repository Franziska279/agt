var express = require('express');
var router = express.Router();

router.get('/', handleRedirect);
router.post('/', handleRedirect);

function handleRedirect(req, res, next) {
    if (req.body.fromModify != null) {
        res.render('compute', { title: 'Travelr' });
    } else {
        res.redirect('../')
    }
}

module.exports = router;