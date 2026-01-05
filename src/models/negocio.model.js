const db = require('../config/database');

class NegocioModel {
    // Obtener información del negocio
    static async get() {
        const [rows] = await db.query('SELECT * FROM mi_negocio LIMIT 1');
        return rows[0];
    }

    // Verificar si existe información del negocio
    static async exists() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM mi_negocio');
        return rows[0].count > 0;
    }
}

module.exports = NegocioModel;