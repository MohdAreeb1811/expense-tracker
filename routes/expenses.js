const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/expenseController');
const { isAuthenticated } = require('../middleware/auth');

const rules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('description').optional().trim().isLength({ max: 200 })
];

router.use(isAuthenticated);

router.get('/',           ctrl.index);
router.get('/new',        ctrl.newForm);
router.post('/',          rules, ctrl.create);
router.get('/:id/edit',   ctrl.editForm);
router.put('/:id',        rules, ctrl.update);
router.delete('/:id',     ctrl.delete);

module.exports = router;
