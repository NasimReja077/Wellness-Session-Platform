import mongoose from "mongoose";

const connectionDB = async() => {
     try {
          const connectionInStance = await mongoose.connect(`${process.env.MONGODB_URI}`)
          console.log(`\n MongoDB connected !! DB HOST: ${connectionInStance.connection.host}`)
     } catch (error) {
          console.log("MONGODB Connection FAILED ", error);
          process.exit(1)
     }
}

export default connectionDB