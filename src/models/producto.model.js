const db = require('../config/database');

class ProductoModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async getByCodigo(codigo) {
        const [rows] = await db.query('SELECT * FROM productos WHERE codigo = ?', [codigo]);
        return rows[0];
    }

    static async getConImagenes() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca,
                GROUP_CONCAT(img.url) AS imagenes
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            LEFT JOIN img_productos AS img ON img.cod_producto = p.codigo AND img.estado = 'activo'
            GROUP BY p.id
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }
}

module.exports = ProductoModel;