var express = require('express');
var router = express.Router();

/* GET something to list maybe?. */
router.get('/', handleRedirect);
router.post('/', handleRedirect);

function handleRedirect(req, res, next) {
    if (req.body.fromIndex != null) {
        res.render('modify', { title: 'Travelr' });
    } else {
        res.redirect('../')
    }
}

module.exports = router;