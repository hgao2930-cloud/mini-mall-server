import 'dotenv/config'
import app from './app.js'

const port = Number(process.env.PORT || 3000)

app.listen(port, () => {
  console.log(`MiniMall API 已启动: http://localhost:${port}/api`)
})
