const db = require('../config/database');

class TipoPersonaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_persona WHERE estado = "activo"');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_persona WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoPersonaModel;