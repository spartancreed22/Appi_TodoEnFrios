const db = require('../config/database');

class CategoriaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByTipo(tipo) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE tipo_categoria = ? AND estado = "activo"', [tipo]);
        return rows;
    }
}

module.exports = CategoriaModel;