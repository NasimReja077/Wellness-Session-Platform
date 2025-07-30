import mongoose from "mongoose";

const connectionDB = async() => {
     try {
          const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
               useNewUrlParser: true,
               useUnifiedTopology: true,
          });
          console.log(`✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
     } catch (error) {
          console.error("❌ MONGODB Connection FAILED:", error);
          process.exit(1);
     }
};

// Connection events
mongoose.connection.on('connected', () => {
     console.log('✅ MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
     console.error('❗ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
     console.log('⚠️ MongoDB disconnected');
});

export default connectionDB;