const db = require('../config/database');

class TipoUsuarioModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_usuario');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoUsuarioModel;