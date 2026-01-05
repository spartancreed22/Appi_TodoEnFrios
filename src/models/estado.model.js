const db = require('../config/database');

class EstadoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM estados ORDER BY id ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM estados WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = EstadoModel;