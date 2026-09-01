import { Router } from 'express'
import { pool } from '../db.js'
import authRequired from '../middleware/auth.js'

const router = Router()

// 合法的状态流转：待付款 -> 待收货 -> 已完成
const VALID_TRANSITIONS = { 待付款: '待收货', 待收货: '已完成' }

function mapOrder(row) {
  return {
    id: String(row.id),
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at,
  }
}

// GET /api/orders
router.get('/', authRequired, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, items, total_price, status, created_at
       FROM orders WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [req.userId],
    )
    res.json(rows.map(mapOrder))
  } catch (err) {
    next(err)
  }
})

// POST /api/orders —— 下单（商品快照 + 金额）
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { items } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: '订单不能为空' })
    }
    let isValid = true
    const validItems = new Map()
    items.forEach((item) => {
      if (!item) return isValid = false
      if (!item.product) return isValid = false
      if (!item.product.id) return isValid = false
      if (typeof (item.quantity) !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) return isValid = false
      validItems.set(item.product.id, item.quantity)
    })
    if (!isValid) {
      return res.status(400).json({ message: '订单数据不合法' })
    }
    const ids = items.map(item => item.product.id)
    const placeholders = ids.map(() => '?').join(',')
    const [products] = await pool.query(
      `SELECT id, name, price, image, description, category FROM products WHERE id IN (${placeholders})`,
      ids
    )
    if (validItems.size !== products.length) {
      return res.status(400).json({ message: '商品不存在' })
    }
    const productMap = new Map(products.map(p => [p.id, p]))
    // 商品快照由服务端从数据库生成，不信任客户端传来的商品名称/价格/图片
    const snapshot = []
    let totalPrice = 0
    for (const item of items) {
      const product = productMap.get(item.product.id)
      snapshot.push({
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          category: product.category,
        },
        quantity: item.quantity,
      })
      totalPrice += product.price * item.quantity
    }
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, items, total_price) VALUES (?, ?, ?)',
      [req.userId, JSON.stringify(snapshot), totalPrice],
    )
    const [rows] = await pool.query(
      'SELECT id, user_id, items, total_price, status, created_at FROM orders WHERE id = ?',
      [result.insertId],
    )
    res.status(201).json(mapOrder(rows[0]))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/orders/:id —— 状态流转（只允许自己的订单）
router.patch('/:id', authRequired, async (req, res, next) => {
  try {
    const { status } = req.body || {}
    const [rows] = await pool.query(
      'SELECT id, user_id, status FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId],
    )
    if (!rows.length) {
      return res.status(404).json({ message: '订单不存在' })
    }

    const order = rows[0]
    if (VALID_TRANSITIONS[order.status] !== status) {
      return res
        .status(400)
        .json({ message: `订单状态不允许从「${order.status}」变更为「${status}」` })
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, order.id])
    const [updated] = await pool.query(
      'SELECT id, user_id, items, total_price, status, created_at FROM orders WHERE id = ?',
      [order.id],
    )
    res.json(mapOrder(updated[0]))
  } catch (err) {
    next(err)
  }
})

export default router
