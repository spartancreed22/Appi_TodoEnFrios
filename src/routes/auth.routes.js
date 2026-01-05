const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { documento, password } = req.body;

        if (!documento || !password) {
            return res.status(400).json({
                success: false,
                error: 'Documento y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE documento = ?',
            [documento]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar contraseña (en tu caso es texto plano, idealmente debería ser bcrypt)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                documento: user.documento,
                nombres: user.nombres,
                apellidos: user.apellidos,
                id_tipo_usuario: user.id_tipo_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                documento: user.documento,
                nombres: user.nombres,
                apellidos: user.apellidos,
                tipo_usuario: user.id_tipo_usuario
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;