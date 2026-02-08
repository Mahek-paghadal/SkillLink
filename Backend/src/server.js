const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');


const connectDB = require("./config/db");
const { swaggerSpec } = require("./docs/swagger");

const app = express();

/// connect database
connectDB();

/// Middleware
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/// Routes
app.use("/api/auth" , require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/landing", require("./routes/landing.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/jobs", require("./routes/job.routes"));


/// health check
app.get("/" , (req , res) => {
    res.send("Backend is running");
}); 


const PORT = process.env.PORT || 5000;

app.listen(PORT , () => {
    console.log(`server running on port ${PORT}`);
});