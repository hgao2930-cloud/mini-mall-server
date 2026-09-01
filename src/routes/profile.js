import { Router } from 'express'
import { pool } from '../db.js'
import authRequired from '../middleware/auth.js'

const router = Router()

// GET /api/profile —— 收货信息
router.get('/',authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT name, phone, address FROM users WHERE id = ?', [
      req.userId,
    ])
    if (!rows.length) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json({ name: rows[0].name || '', phone: rows[0].phone || '', address: rows[0].address || '' })
  } catch (err) {
    next(err)
  }
})

// PUT /api/profile —— 保存收货信息
router.put('/',authRequired, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body || {}
    await pool.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [
      name || '',
      phone || '',
      address || '',
      req.userId,
    ])
    res.json({ name: name || '', phone: phone || '', address: address || '' })
  } catch (err) {
    next(err)
  }
})

export default router
