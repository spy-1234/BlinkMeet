import httpStatus from 'http-status';
import { User } from "../models/user.model.js";
import bcrypt, { hash } from 'bcrypt';
import crypto from 'crypto'; // Import the crypto module for generating random tokens

// Function to handle user login
const login = async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide username and password" });
    }

    try{
        const user = await User.findOne({ username });
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        if(bcrypt.compare(password, user.password)){
            let token = crypto.randomBytes(20).toString('hex'); // Generate a random token
            user.token = token; // Assign the token to the user
            await user.save(); // Save the user with the new token
            res.status(httpStatus.OK).json({token: token}); // Respond with the token
        }else{
            res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username and password" });
        }
    }catch(err){
        res.status(500).json({message: `Something went wrong ${err}`});
    }
}


// Function to handle user registration
const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({username}) // Check if the user already exists 
        // user.findOne() is a method that queries the database for a single document that matches the specified criteria. 
        // In this case, it looks for a user with the same username as the one provided in the request body.
        if(existingUser){
            res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt
            const newUser = new User({
                name: name,
                username: username,
                password: hashedPassword
            });

            await newUser.save(); // Save the new user to the database
            return res.status(httpStatus.CREATED).json({ message: "User Registered" }); // Respond with a success message
            
    }catch(err){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Not able to register' });
    }
}

export { login, register };