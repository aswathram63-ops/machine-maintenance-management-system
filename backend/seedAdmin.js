
const db = require("./config/db");
const bcrypt = require("bcrypt");

async function createAdmin() {
    try {
        const name = "System Admin";
        const email = "admin@mmbms.com";
        const password = "Admin@123";

        const [existing] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            console.log("Admin account already exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, "Admin"]
        );

        console.log("Admin account created successfully!");

    } catch (error) {
        console.error(error);
    } finally {
        await db.end();
    }
}

createAdmin();
