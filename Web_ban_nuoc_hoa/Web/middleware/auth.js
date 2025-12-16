function requireRole(roles) {
    return function (req, res, next) {
        if (!req.session.user || !roles.includes(req.session.user.vai_tro)) {
            return res.status(403).send('Không có quyền');
        }
        next();
    };
}


module.exports = requireRole;