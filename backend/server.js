require('dotenv').config();


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/posts', postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get('/', (req, res) => {
    res.send('Reddit Clone Backend is running!');
});

const PORT = process.env.PORT || 5000;

console.log('About to connect to MongoDB...');

connectDB()
    .then(() => {
        console.log('Database connection completed!');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Server startup failed:', error.message);
    });
