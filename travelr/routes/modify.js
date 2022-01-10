var express = require('express');
var router = express.Router();

router.get('/', handleRedirect);
router.post('/', handleRedirect);

function handleRedirect(req, res, next) {
    if (req.body.fromIndex != null) { // to prevent path traversal
        res.render('modify', { title: 'Travelr' });
    } else {
        res.redirect('../')
    }
}

module.exports = router;
