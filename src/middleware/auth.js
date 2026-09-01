import jwt from 'jsonwebtoken'
import 'dotenv/config'

export default function authRequired(req, res, next) {
    try {
        let token
        if (req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1]
        }
        else{
            token = req.cookies.token
        }
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