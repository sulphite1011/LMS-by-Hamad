import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
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
app.use(express.json());  // ADDED THIS LINE - for general JSON parsing


//sample route
app.get('/', (req, res) => {
  res.send('API is working...');
}); 

// im replacing express.json() with express.raw({ type: "application/json" })

app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

app.use('/api/educator' , educatorRouter)  // REMOVED express.json() from here since it's already applied globally

app.use('/api/course' , courseRouter )
app.use('/api/course' , courseRouter )
app.use('/api/user' , userRouter )  


//set port
 const PORT = process.env.PORT || 5000;

//start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 







// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './configs/mongodb.js';
// import { clerkWebhooks } from './controllers/webhooks.js';
// import educatorRouter from './routes/educatorRoutes.js';
// import { clerkMiddleware } from '@clerk/express';
// import connectCloudinary from './configs/cloudinary.js';


//  //initialize express app.
// const app = express();

// //connect to db
// await connectDB(); 
// await connectCloudinary(); 
 

// //middleware
// app.use(cors());
// app.use(clerkMiddleware());


// //sample route
// app.get('/', (req, res) => {
//   res.send('API is working...');
// }); 

// // im replacing express.json() with express.raw({ type: "application/json" })

// app.post(
//   "/clerk",
//   express.raw({ type: "application/json" }),
//   clerkWebhooks
// );

// app.use('/api/educator' , express.json(), educatorRouter)

// //set port
//  const PORT = process.env.PORT || 5000;

// //start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// }); 
