const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const machineRoutes = require("./routes/machineRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const breakdownRoutes = require("./routes/breakdownRoutes");
const workLogRoutes = require("./routes/workLogRoutes");
const userRoutes = require("./routes/userRoutes");
const machineHistoryRoutes = require("./routes/machineHistoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");


const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/breakdowns", breakdownRoutes);
app.use("/api/work-logs", workLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/machine-history", machineHistoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "MMBMS Backend API is Running!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT DATABASE() AS db");

        res.json({
            success: true,
            message: "Database connected successfully",
            database: rows[0].db
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
