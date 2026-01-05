const db = require('../config/database');

class ConductorModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM conductores ORDER BY nombre ASC');
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query('SELECT * FROM conductores WHERE documento = ?', [documento]);
        return rows[0];
    }
}

module.exports = ConductorModel;