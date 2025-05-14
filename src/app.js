import express from 'express';
import {createServer} from 'node:http';
import {Socket} from 'socket.io';
import cors from 'cors';
import userRoutes from "./routes/users.routes.js";

import {mongoose} from 'mongoose';
import { connectToSocket } from './controllers/socketManager.js'; 

const app = express();
const server = createServer(app); // Create an HTTP server using the Express app
const io = connectToSocket(server); // Initialize Socket.IO with the server

app.set("port", (process.env.PORT || 8000)); // Set the port to 8000 or the value from the environment variable PORT
app.use(cors()) // Enable CORS for all routes
app.use(express.json({limit: "40kb"})) /// Parse incoming JSON requests with a limit of 40kb
app.use(express.urlencoded({limit: "40kb", extended: true})) // Parse incoming URL-encoded requests with a limit of 40kb


app.use('/api/v1/users', userRoutes)  // Use the user routes for API version 1

const start = async ()=> {
    const connectionDb = await mongoose.connect('mongodb+srv://jsprogramming123:Shirley%4095@cluster0.uefentu.mongodb.net/')  // write password carefully
    console.log(`Mongo connected to Db host: ${connectionDb.connection.host} `); // Log the host of the connected MongoDB instance

    server.listen(8000, () => {
        console.log('Server is running on port 8000');
    });
}
start();