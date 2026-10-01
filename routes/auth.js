const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { isGuest } = require('../middleware/auth');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
];

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.get('/register', isGuest, ctrl.getRegister);
router.post('/register', isGuest, registerRules, ctrl.postRegister);
router.get('/login', isGuest, ctrl.getLogin);
router.post('/login', isGuest, loginRules, ctrl.postLogin);
router.post('/logout', ctrl.logout);

module.exports = router;
