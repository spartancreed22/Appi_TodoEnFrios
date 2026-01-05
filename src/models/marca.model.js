const db = require('../config/database');

class MarcaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM marcas ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM marcas WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByTipo(tipo) {
        const [rows] = await db.query('SELECT * FROM marcas WHERE tipo_marca = ? AND status = "activo"', [tipo]);
        return rows;
    }
}

module.exports = MarcaModel;