const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({ 
            error: 'Token no proporcionado' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                error: 'Token inválido o expirado' 
            });
        }

        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user.id_tipo_usuario !== 1) {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requiere permisos de administrador' 
        });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };