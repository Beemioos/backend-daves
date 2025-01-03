const { prisma } = require('../prisma/prisma-client')

const BasketController = {
	addToBasket: async (req, res) => {
		const { userId, orderId } = req.body
		const { qua } = req.body

		try {
			const basket = await prisma.basket.findUnique({
				where: { userId: parseInt(userId) },
			})

			if (!basket) {
				return res
					.status(404)
					.json({ error: 'Корзина пользователя не найдена' })
			}

			const basketOrder = await prisma.basketOrder.findUnique({
				where: {
					basketId_orderId: {
						basketId: basket.id,
						orderId: parseInt(orderId),
					},
				},
			})

			if (basketOrder) {
				await prisma.basketOrder.update({
					where: { id: basketOrder.id },
					data: { quantity: { increment: 1 } },
				})
			} else {
				await prisma.basketOrder.create({
					data: {
						basketId: basket.id,
						orderId: parseInt(orderId),
						quantity: qua,
					},
				})
			}

			return res.status(200).json({ message: 'Товар добавлен в корзину' })
		} catch (error) {
			console.error('Ошибка при добавлении товара в корзину:', error)
			res.status(500).json({ error: 'Ошибка сервера' })
		}
	},

	removeFromBasket: async (req, res) => {
		const { userId, orderId } = req.body

		try {
			// Проверяем, существует ли корзина пользователя
			const basket = await prisma.basket.findUnique({
				where: { userId: parseInt(userId) },
			})

			if (!basket) {
				return res
					.status(404)
					.json({ error: 'Корзина пользователя не найдена' })
			}

			// Удаляем связь между корзиной и товаром
			await prisma.basketOrder.deleteMany({
				where: {
					basketId: basket.id,
					orderId: parseInt(orderId),
				},
			})

			return res.status(200).json({ message: 'Товар удален из корзины' })
		} catch (error) {
			console.error('Ошибка при удалении товара из корзины:', error)
			res.status(500).json({ error: 'Ошибка сервера' })
		}
	},

	decreaseQuantity: async (req, res) => {
		const { userId, orderId } = req.body

		try {
			const basket = await prisma.basket.findUnique({
				where: { userId: parseInt(userId) },
			})

			if (!basket) {
				return res
					.status(404)
					.json({ error: 'Корзина пользователя не найдена' })
			}

			const basketOrder = await prisma.basketOrder.findUnique({
				where: {
					basketId_orderId: {
						basketId: basket.id,
						orderId: parseInt(orderId),
					},
				},
			})

			if (!basketOrder) {
				return res.status(404).json({ error: 'Товар в корзине не найден' })
			}

			if (basketOrder.quantity > 1) {
				await prisma.basketOrder.update({
					where: { id: basketOrder.id },
					data: { quantity: { decrement: 1 } },
				})
			}
			return res.status(200).json({ message: 'Количество товара уменьшено' })
		} catch (error) {
			console.error('Ошибка при уменьшении количества товара:', error)
			res.status(500).json({ error: 'Ошибка сервера' })
		}
	},

	getBasket: async (req, res) => {
		const { userId } = req.params

		try {
			const basket = await prisma.basket.findUnique({
				where: { userId: parseInt(userId) },
				include: {
					orders: {
						include: {
							order: true,
						},
					},
				},
			})

			if (!basket) {
				return res
					.status(404)
					.json({ error: 'Корзина пользователя не найдена' })
			}

			return res.status(200).json(basket.orders)
		} catch (error) {
			console.error('Ошибка при получении корзины пользователя:', error)
			res.status(500).json({ error: 'Ошибка сервера' })
		}
	},
}

module.exports = BasketController
