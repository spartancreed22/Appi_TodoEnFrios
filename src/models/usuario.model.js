const db = require('../config/database');

class UsuarioModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT u.*, tu.tipo_usuario, e.estado 
            FROM usuarios u 
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            LEFT JOIN estados e ON u.id_estado = e.id 
            ORDER BY u.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query(`
            SELECT u.*, tu.tipo_usuario, e.estado 
            FROM usuarios u 
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            LEFT JOIN estados e ON u.id_estado = e.id 
            WHERE u.documento = ?
        `, [documento]);
        return rows[0];
    }
}

module.exports = UsuarioModel;