import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

// GET /api/products
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, price, image, description, category FROM products ORDER BY id',
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, price, image, description, category FROM products WHERE id = ?',
      [req.params.id],
    )
    if (!rows.length) {
      return res.status(404).json({ message: '商品不存在' })
    }
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
