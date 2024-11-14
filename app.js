require('dotenv').config();
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const googleRoute = require("./routes/googleRoute");
const phoneRoutes = require('./routes/phoneRoutes');
const app = express();

const corsOptions = {
  origin: ['https://task-int.vercel.app', 'http://localhost:3000','https://finaure.com','https://www.finaure.com'],
  credentials: true,
};

app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json());
app.use(cookieParser());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", ["https://task-int.vercel.app","http://localhost:3000"]);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/phone', phoneRoutes);
app.use("/api", googleRoute);

// Error handling middleware
const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
