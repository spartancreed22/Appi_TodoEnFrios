const { query, param, validationResult } = require('express-validator');

// Middleware para verificar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Datos inválidos',
            message: 'Los datos proporcionados no son válidos',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            })),
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Validaciones comunes
const validators = {
    // Validar ID numérico
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo')
            .toInt()
    ],

    // Validar documento
    documento: [
        param('documento')
            .trim()
            .notEmpty()
            .withMessage('El documento no puede estar vacío')
            .isLength({ min: 5, max: 20 })
            .withMessage('El documento debe tener entre 5 y 20 caracteres')
            .matches(/^[0-9]+$/)
            .withMessage('El documento solo debe contener números')
    ],

    // Validar código de producto
    codigo: [
        param('codigo')
            .trim()
            .notEmpty()
            .withMessage('El código no puede estar vacío')
            .isLength({ max: 50 })
            .withMessage('El código no puede exceder 50 caracteres')
    ],

    // Validar query de búsqueda
    search: [
        query('q')
            .trim()
            .notEmpty()
            .withMessage('El término de búsqueda no puede estar vacío')
            .isLength({ min: 2, max: 100 })
            .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
            .escape() // Previene XSS
    ]
};

module.exports = {
    validate,
    validators
};