const db = require('../config/database');

class RolModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM roles WHERE status = "activo" ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = RolModel;