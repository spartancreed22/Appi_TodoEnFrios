const db = require('../config/database');

class ImgProductoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE estado = "activo" ORDER BY fecha_crea DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByCodProducto(codProducto) {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE cod_producto = ? AND estado = "activo"', [codProducto]);
        return rows;
    }
}

module.exports = ImgProductoModel;