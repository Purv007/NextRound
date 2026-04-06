require("dotenv").config();
const app = require("./src/app.js")
const connectToDatabase=require("./src/config/database.js");

connectToDatabase();


app.listen(3000, () => {
    console.log(`Server is running on port 3000`)
})