const db = require('../config/database');

class MiNegocioModel {
    static async get() {
        const [rows] = await db.query('SELECT * FROM mi_negocio LIMIT 1');
        return rows[0];
    }
}

module.exports = MiNegocioModel;