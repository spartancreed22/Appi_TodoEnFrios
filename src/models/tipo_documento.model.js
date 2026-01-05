const db = require('../config/database');

class TipoDocumentoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_documento WHERE estado = "activo"');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_documento WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoDocumentoModel;