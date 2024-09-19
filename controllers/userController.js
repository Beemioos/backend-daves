const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

const jwt = require('jsonwebtoken')
const { prisma } = require('../prisma/prisma-client')

const UserController = {
	register: async (req, res) => {
		const { email, password, name, login, phone, inn, status, ogrn } = req.body
		let ogrnip = null
		let ogrnNew = ogrn

		if (!email || !password || !name || !login || !phone || !inn || !status) {
			return res.json({ error: 'Все поля обязательны' })
		}

		if (ogrnNew && ogrnNew.length === 13) {
			ogrnip = null
		} else if (ogrnNew && ogrnNew.length === 15) {
			ogrnip = ogrnNew
			ogrnNew = null
		} else {
			ogrnNew = null
			ogrnip = null
		}

		try {
			const existingUser = await prisma.user.findUnique({
				where: { login },
			})
			if (existingUser) {
				return res.status(400).json({ error: 'Пользователь уже существует' })
			}

			if (ogrnNew) {
				const existingOgrn = await prisma.user.findMany({
					where: { ogrn: ogrnNew },
				})
				if (existingOgrn.length > 0) {
					return res.status(400).json({ error: 'Введите действительный ОГРН' })
				}
			}
			if (ogrnip) {
				const existingOgrnip = await prisma.user.findMany({
					where: { ogrnip },
				})
				if (existingOgrnip.length > 0) {
					return res
						.status(400)
						.json({ error: 'Введите действительный ОГРНИП' })
				}
			}
			if (inn) {
				const existingInn = await prisma.user.findUnique({
					where: {
						inn: inn,
					},
				})

				if (existingInn) {
					return res.status(400).json({ error: 'Введите действительный ИНН' })
				}
			}
			const hashedPassword = await bcrypt.hash(password, 10)
			const user = await prisma.user.create({
				data: {
					login,
					password: hashedPassword,
					email,
					name,
					phone,
					ogrn: ogrnNew,
					ogrnip,
					inn,
					status,
				},
			})

			res.json(user)
		} catch (error) {
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
			})
			res.status(500).json({ error: 'Internal server error' })
		}
	},

	login: async (req, res) => {
		const { login, password } = req.body
		try {
			const user = await prisma.user.findUnique({ where: { login } })
			if (!user) {
				return res.status(400).json({ error: 'Неверный логин или пароль' })
			}
			const valid = await bcrypt.compare(password, user.password)
			if (!valid) {
				return res.status(400).json({ error: 'Неверный логин или пароль' })
			}

			const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY)

			res.json({ token })
		} catch (error) {
			console.error('Error in login:', error)
			res.status(500).json({ error: 'Internal server error' })
		}
	},
	updateUser: async (req, res) => {
		const { id } = req.params
		const { email, name, password, login, phone, status, ogrn, inn } = req.body
		const userId = parseInt(id)
		let ogrnip = null
		let ogrnNew = ogrn
		if (ogrnNew && ogrnNew.length === 13) {
			ogrnip = null
		} else if (ogrnNew && ogrnNew.length === 15) {
			ogrnip = ogrnNew
			ogrnNew = null
		} else {
			ogrnNew = null
			ogrnip = null
		}
	
		try {
			if (ogrnNew && ogrnNew !== (await prisma.user.findUnique({ where: { id: userId } })).ogrn) {
				const existingOgrn = await prisma.user.findFirst({
					where: { ogrn: ogrnNew },
				})
				if (existingOgrn) {
					return res.status(400).json({ error: 'Введите действительный ОГРН' })
				}
			}
	
			if (ogrnip && ogrnip !== (await prisma.user.findUnique({ where: { id: userId } })).ogrnip) {
				const existingOgrnip = await prisma.user.findFirst({
					where: { ogrnip },
				})
				if (existingOgrnip) {
					return res.status(400).json({ error: 'Введите действительный ОГРНИП' })
				}
			}
			if (inn && inn !== (await prisma.user.findUnique({ where: { id: userId } })).inn) {
				const existingInn = await prisma.user.findUnique({
					where: { inn },
				})
	
				if (existingInn) {
					return res.status(400).json({ error: 'Введите действительный ИНН' })
				}
			}
	
			if (login) {
				const existingUser = await prisma.user.findFirst({
					where: { login: login },
				})
	
				if (existingUser && existingUser.id !== userId) {
					return res.status(400).json({ error: 'Логин занят' })
				}
			}
	
			const updateData = {
				email: email || undefined,
				name: name || undefined,
				password: password ? await bcrypt.hash(password, 10) : undefined,
				login: login || undefined,
				phone: phone || undefined,
				status: status || undefined,
				ogrn: ogrnNew || undefined,
				ogrnip:  ogrnip || undefined,
				inn: inn || undefined,
			}
	
			const user = await prisma.user.update({
				where: { id: userId },
				data: updateData,
			})
			res.json(user)
	
		} catch (error) {
			console.log('error', error)
			res.status(500).json({ error: 'Что-то пошло не так' })
		}
	},
	

	current: async (req, res) => {
		try {
			if (!req.user || !req.user.userId) {
				return res.status(400).json({ error: 'Нет данных пользователя' })
			}

			console.log('User ID:', req.user.userId)

			const user = await prisma.user.findUnique({
				where: { id: req.user.userId },
			})

			if (!user) {
				return res.status(400).json({ error: 'Не удалось найти пользователя' })
			}

			return res.status(200).json(user)
		} catch (error) {
			console.log('Ошибка в обработчике /api/current:', error) // Логирование ошибки
			res.status(500).json({ error: 'Что-то пошло не так' })
		}
	},
}

module.exports = UserController
