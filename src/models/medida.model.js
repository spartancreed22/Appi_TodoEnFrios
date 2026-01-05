const db = require('../config/database');

class MedidaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM medidas ORDER BY medida ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM medidas WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = MedidaModel;