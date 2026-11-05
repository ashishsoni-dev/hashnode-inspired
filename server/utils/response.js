export function sendSuccess(res, data, statusCode = 200, extra = {}) {
    return res.status(statusCode).json({ success: true, data, ...extra });
}
