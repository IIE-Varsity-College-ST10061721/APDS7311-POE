// /routes/userRoutes.js
const express = require('express');
const { login} = require('../controllers/userController');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { user, token } = await login(username, password);
        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});



module.exports = router;
