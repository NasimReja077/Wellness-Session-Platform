// Backend/ src/ index.js

import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
     path: './.env'
})


app.listen(process.env.PORT || 7000, () =>{
     console.log(`⚡️ Server is running on port ${process.env.PORT}`);
});
