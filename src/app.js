import express from 'express'
import cors from 'cors'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import profileRoutes from './routes/profile.js'
import authRoutes from './routes/auth.js'

const app = express()

// TODO(练习)：完成登录鉴权后，如需 httpOnly cookie 方案，请打开 credentials 并指定前端 origin
app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/auth',authRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ message: '接口不存在' })
})

// 统一错误处理
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: '服务器内部错误' })
})

export default app
