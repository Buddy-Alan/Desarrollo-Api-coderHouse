

export const checkLogin = (req, res, next) => {
    if (!!req.user) {
        next()
    }
    else {
        res.json({ messages: "Por favor inice primero sesion" })
    }
}