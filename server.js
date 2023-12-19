const express = require('express')
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { withAccelerate } = require('@prisma/extension-accelerate')

const app = express()
// const prisma = new PrismaClient()
const prisma = new PrismaClient().$extends(withAccelerate())


app.use(express.json())

// Test connection to database and log a message
async function main() {
    const allUsers = await prisma.user.findMany()
    console.log(`Connected to the database. Number of users: ${allUsers.length}`)
}

main().catch((e) => {
    throw e
})

// Get all users
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({
        cacheStrategy: { ttl: 60 }
    })
    console.log('All users received: ', users)
    res.json(users)
})

// Create a user
app.post('/user', async (req, res) => {
    const { name, email } = req.body;

    const result = await prisma.user.create({
        data: {
            name: name,
            email: email,
        },
    })

    console.log('User created', result)
    res.json(result)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit()
})