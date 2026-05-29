const { body, validationResult } = require('express-validator');

const validarRegistro = [
    body('email')
        .isEmail().withMessage('Correo inválido')
        .matches(/@(alumno\.ipn\.mx|ipn\.mx)$/).withMessage('Debes usar correo institucional IPN'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }),
    body('carrera')
        .notEmpty().withMessage('La carrera es obligatoria'),
    body('semestre')
        .isInt({ min: 1, max: 12 }).withMessage('Semestre debe ser entre 1 y 12'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validarLogin = [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validarRegistro, validarLogin };