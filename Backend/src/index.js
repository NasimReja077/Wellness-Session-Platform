// Backend/ src/ index.js

import dotenv from "dotenv";
import { app } from "./app.js";
import connectionDB from "./db/index.js";

dotenv.config({
     path: './.env'
})

const startServer = async () => {
     try {
          await connectionDB();
          app.listen(process.env.PORT || 7000, () => {
               console.log(`⚡️ Server is running on port ${process.env.PORT || 7000}`);
          });
     } catch (error) {
          console.error("❌ MONGO DB Connection FAILED !!!", error);
          process.exit(1); // Exit process with failure
     }
}

startServer();