const path = require('path')
const fs = require('fs')
const { prisma } = require('../prisma/prisma-client')
const QRCode = require('qrcode')

const OrderController = {
	createOrder: async (req, res) => {
		const {
			orderName,
			dateTransfer,
			dateReceipt,
			clientName,
			passport,
			phone,
			weight,
			volume,
			address,
			dateDelivery,
			cost,
			userId,
		} = req.body

		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded' })
		}

		if (
			!orderName ||
			!clientName ||
			!passport ||
			!phone ||
			!weight ||
			!volume ||
			!address ||
			!dateDelivery ||
			!dateTransfer ||
			!dateReceipt ||
			!cost
		) {
			return res.status(422).json({ error: 'Все поля обязательны' })
		}

		try {
			const imagePath = `/uploads/${req.file.filename}`
			const order = await prisma.order.create({
				data: {
					orderName,
					clientName,
					passport,
					weight: parseFloat(weight),
					volume: parseFloat(volume),
					phone,
					address,
					dateDelivery: new Date(dateDelivery),
					dateTransfer: new Date(dateTransfer),
					dateReceipt: new Date(dateReceipt),
					cost: parseFloat(cost),
					image: imagePath,
					histories: {
						create: {
							userId: parseInt(userId, 10),
						},
					},
				},
			})

			res.json(order)
		} catch (error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
			})
			res.status(500).json({ error: 'Internal server error' })
		}
	},

	getAllOrder: async (req, res) => {
		try {
			const orders = await prisma.order.findMany()
			if (!orders.length) {
				return res.status(404).json({ error: 'Ордеры не найдены' })
			}
			res.json(orders)
		} catch (error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
			})
			res.status(500).json({ error: 'Internal server error' })
		}
	},
	getOrderByUserId: async (req, res) => {
		const { userId } = req.query

		if (!userId || isNaN(userId)) {
			return res.status(400).json({ error: 'Invalid user ID' })
		}

		try {
			const orders = await prisma.order.findMany({
				where: {
					histories: {
						some: {
							userId: parseInt(userId, 10),
						},
					},
				},
			})

			if (!orders.length) {
				return res.status(404).json({ error: 'No orders found for this user' })
			}

			res.json(orders)
		} catch (error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
			})
			res.status(500).json({ error: 'Internal server error' })
		}
	},

	// getOrderById: async (req, res) => {
	// 	const userId = parseInt(req.params.id, 10)
	// 	if (isNaN(userId)) {
	// 		return res.status(400).json({ error: 'Invalid user ID' })
	// 	}
	// 	try {
	// 		const orders = await prisma.order.findMany({
	// 			where: {
	// 				histories: {
	// 					some: {
	// 						userId: userId,
	// 					},
	// 				},
	// 			},
	// 		})

	// 		if (!orders.length) {
	// 			return res.status(404).json({ error: 'No orders found for this user' })
	// 		}

	// 		res.json(orders)
	// 	} catch (error) {
	// 		console.error('Error details:', {
	// 			message: error.message,
	// 			stack: error.stack,
	// 		})
	// 		res.status(500).json({ error: 'Internal server error' })
	// 	}
	// },

	getOrderByID: async (req, res) => {
		const { id } = req.params
		const orderId = parseInt(id, 10)

		if (isNaN(orderId)) {
			return res.status(400).json({ error: 'Неверный ID заказа' })
		}

		try {
			const order = await prisma.order.findUnique({
				where: { id: orderId },
			})

			if (!order) {
				return res.status(404).json({ error: 'Заказ не найден' })
			}

			res.json(order)
		} catch (error) {
			console.error('Ошибка:', error)
			res.status(500).json({ error: 'Что-то пошло не так' })
		}
	},

	updateOrderById: async (req, res) => {
		const { id } = req.params
		const { status } = req.body

		const orderId = parseInt(id, 10)
		if (isNaN(orderId)) {
			return res.status(400).json({ error: 'Неверный ID заказа' })
		}

		try {
			let qrCodePath = null
			const order = await prisma.order.findUnique({ where: { id: orderId } })

			if (!order) {
				return res.status(404).json({ error: 'Заказ не найден' })
			}

			if (
				status === 'in-progress' ||
				status === 'rejected' ||
				status === 'completed'
			) {
				const qrData = {
					orderId: order.id,
					address: order.address,
					dateDelivery: order.dateDelivery,
					phone: order.phone,
				}

				// Генерация QR-кода в SVG формате
				const qrSvg = await QRCode.toString(
					`https://mysitebeemioos/guest/${order.id}`,
					{ type: 'svg' }
				)

				const qrPath = path.join(__dirname, '../uploads/qr')
				const qrFileName = `order-${order.id}.svg`
				const qrFullPath = path.join(qrPath, qrFileName)

				fs.writeFileSync(qrFullPath, qrSvg)
				qrCodePath = `/uploads/qr/${qrFileName}`
			}

			const updatedOrder = await prisma.order.update({
				where: { id: orderId },
				data: { status, qrCodePath },
			})

			res.json(updatedOrder)
		} catch (error) {
			console.error('Ошибка:', error)
			res.status(500).json({ error: 'Что-то пошло не так' })
		}
	},
}

module.exports = OrderController
