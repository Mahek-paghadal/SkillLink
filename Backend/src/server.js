const express = require('express');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./docs/swagger');


const connectDB = require("./config/db");

const app = express();

/// connect database
connectDB();

/// Middleware
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { persistAuthorization: true }
}));
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

/// Routes
app.use("/api/auth" , require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));


/// health check
app.get("/" , (req , res) => {
    res.send("Backend is running");
}); 


const PORT = process.env.PORT || 5000;

app.listen(PORT , () => {
    console.log(`server running on port ${PORT}`);
});