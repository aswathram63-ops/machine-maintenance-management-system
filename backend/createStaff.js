
const db = require("./config/db");
const bcrypt = require("bcrypt");

const createStaff = async () => {
    try {
        const name = "Maintenance Staff";
        const email = "staff@mmbms.com";
        const password = "Staff@123";

        // Check whether email already exists
        const [existing] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            console.log("Staff account already exists!");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert staff account
        await db.query(
            `INSERT INTO users
            (name, email, password, role, is_active)
            VALUES (?, ?, ?, 'Maintenance Staff', TRUE)`,
            [name, email, hashedPassword]
        );

        console.log("Maintenance Staff account created!");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await db.end();
    }
};

createStaff();
