import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        req.user = jwt.verify(token, "7a8f9c2d3e4b5a6f7c8d9e0f1a2b3c4d5e6f")
        next()
    } catch (err) {
        res.status(401).json({
            message: "Invalid Token",
            err: err.message
        })
    }

}
export function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Forbidden"
        })
    }
    next()
}
