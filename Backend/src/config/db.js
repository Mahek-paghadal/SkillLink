const mongoose = require('mongoose');

///Connects application to MongoDB Atlas

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected');
    } catch (error){
        console.error('connection failed :' , error);
        process.exit(1);
    }
};

module.exports = connectDB;