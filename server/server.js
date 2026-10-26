require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); // Connection with Mongo DB - Schemas - models
const cors = require('cors'); // Cross-Origin Resource Sharing : Connection between Frontend's Port and Backend's Port
const app = express();
const PORT = process.env.PORT || 5000; // 5000 is default
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET; // Transmitting between files. So ,It's here in this file
const NODE_ENV = process.env.NODE_ENV // Execution Environment

// SRP Single Responsibility Principle + Separation of Concerns
const authRoutes = require("./routes/authRoutes")
const foodOrderRoutes=require("./routes/foodOrderRoutes")
const fuelOrderRoutes=require("./routes/fuelOrderRoutes")
const sanitationRoutes=require("./routes/sanitationRoutes")
const medicalExaminationRoutes = require("./routes/medicalExaminationRoutes")
const preventionPlanRoutes = require("./routes/preventionPlanRoutes")
const feedingPlanRoutes = require("./routes/feedingPlanRoutes")
const pricingRoutes    = require("./routes/pricingRoutes")
const dashboardRoutes  = require('./routes/dashboardRoutes');
const attendanceRoutes = require("./routes/attendanceRoutes");
 const mortalityRoutes = require('./routes/mortality.routes');
const alertRoutes = require('./routes/alert.routes');

// Middleware
app.use(cors());
app.use(express.json()); // Transformation Request Body from JS to JSON



// Connection with Database
// async : Waiting to successful Connection
const connectDB = async () => { 
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};


app.use(authRoutes)
app.use(medicalExaminationRoutes);
app.use(foodOrderRoutes);
app.use(fuelOrderRoutes);
app.use(sanitationRoutes);
app.use(preventionPlanRoutes);
app.use('/api/feeding-plans', feedingPlanRoutes);
app.use('/api/prices',        pricingRoutes);
app.use('/api/dashboard-data', require('./routes/dashboardRoutes'));
app.use(attendanceRoutes);
app.use('/api/mortality', mortalityRoutes);
app.use('/api/alerts', alertRoutes);

// Running Server after Database Connection
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`\n--- Poultry System Backend ---`);
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`✅ Database: MongoDB (Mongoose v${mongoose.version})`);
    console.log(`✅ Status: Running\n`);
  });
};


startServer();


// Processing errors unexpected
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});


// Show information about Database after connection
mongoose.connection.on('connected', () => {
  console.log('✅ متصل بقاعدة البيانات:', mongoose.connection.db.databaseName);
});