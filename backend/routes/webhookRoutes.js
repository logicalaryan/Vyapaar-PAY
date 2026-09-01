// routes/webhookRoutes.js
const express      = require('express');
const router       = express.Router();
const verifyWebhook = require('../middlewares/verifyWebhook');
const { handleWebhook } = require('../controllers/webhookController');

// POST /webhook — receives Razorpay events (real or simulated)
router.post('/', verifyWebhook, handleWebhook);

module.exports = router;
