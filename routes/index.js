const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const OrderController = require('../controllers/orderController')
const BasketController = require('../controllers/basketController')
const { authenticateToken } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDestination = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDestination)) {
	fs.mkdirSync(uploadDestination, { recursive: true })
}
const qrPath = path.join(__dirname, '../uploads/qr')
if (!fs.existsSync(qrPath)) {
	fs.mkdirSync(qrPath, { recursive: true })
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDestination)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	},
})

const upload = multer({ storage: storage })

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authenticateToken, UserController.current)
router.put('/user/:id', authenticateToken, UserController.updateUser)

router.post(
	'/orders',
	authenticateToken,
	upload.single('image'),
	OrderController.createOrder
)
router.get('/allorders', OrderController.getAllOrder)
router.get('/orders', authenticateToken, OrderController.getOrderByUserId)

router.put('/orders/:id', authenticateToken, OrderController.updateOrderById)
// router.get('/orders/:id', authenticateToken, OrderController.getOrderById)
router.get('/orders/:id', OrderController.getOrderByID)

router.post('/basket/add', BasketController.addToBasket)
router.delete('/basket/remove', BasketController.removeFromBasket)
router.get('/basket/:userId', BasketController.getBasket);
router.get('/basket/:userId', BasketController.getBasket);
router.post('/basket/decreaseQuantity', BasketController.decreaseQuantity);



module.exports = router
