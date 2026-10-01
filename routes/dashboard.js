const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, ctrl.index);

module.exports = router;
