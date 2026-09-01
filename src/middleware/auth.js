import jwt from 'jsonwebtoken'
import 'dotenv/config'

export default function authRequired(req, res, next) {
    try {
        if(!req.headers.authorization){
            return res.status(401).json({ message: '未授权' })
        }
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: '未授权' })
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.id
        next()
    }
    catch {
        return res.status(401).json({ message: '未授权' })
    }
}