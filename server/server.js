import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';


 //initialize express app.
const app = express();

//connect to db
await connectDB(); 
await connectCloudinary(); 
 

//middleware
app.use(cors());
app.use(clerkMiddleware());


//sample route
app.get('/', (req, res) => {
  res.send('API is working...stripe done : pending ---> compled');
}); 



app.post( 
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);
app.post(
  "/stripe", express.raw({ type: "application/json" }), stripeWebhooks );


  //middleware
app.use(express.json());




app.use('/api/educator' , educatorRouter)  

app.use('/api/course' , courseRouter )
app.use('/api/course' , courseRouter )
app.use('/api/user' , userRouter )  

//set port
 const PORT = process.env.PORT || 5000;

//start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 

