const router = require('express').Router();
const ctrl = require('../controllers/budgetController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/',        ctrl.index);
router.post('/',       ctrl.upsert);
router.delete('/:id',  ctrl.delete);

module.exports = router;
