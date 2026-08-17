import mongoose from "mongoose"
import dns from "dns"

dns.setDefaultResultOrder("ipv4first")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
    })
    console.log("MongoDB Atlas Connected")
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected")
})

export default connectDB
