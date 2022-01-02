var express = require('express');
var router = express.Router();

router.get('/', handleRedirect);
router.post('/', handleRedirect);

function handleRedirect(req, res, next) {
    if (req.body.fromModify != null) {
        res.setHeader('set-cookie', [
            'cookie1=value1; SameSite=Lax',
            'cookie2=value2; SameSite=None; Secure',
        ]);
        res.render('compute', { title: 'Travelr' });
    } else {
        res.redirect('../')
    }
}

module.exports = router;