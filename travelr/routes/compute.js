var express = require('express');
var router = express.Router();

router.get('/', handleRedirect);
router.post('/', handleRedirect);

function handleRedirect(req, res, next) {
    if (req.method === 'POST') {
        if (req.body.fromModify != null && req.body.tourData != null) {
            res.setHeader('set-cookie', [
                'cookie1=value1; SameSite=Lax',
                'cookie2=value2; SameSite=None; Secure',
            ]);
            res.render('compute', { title: 'Travelr', data: req.body.tourData });
        }
    } else {
        res.redirect('../')
    }
}

module.exports = router;