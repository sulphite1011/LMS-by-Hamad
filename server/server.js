import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';

const app = express();

// Connect to DB and Cloudinary
await connectDB(); 
await connectCloudinary(); 

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(clerkMiddleware());  // Must be before routes that need auth
app.use(express.json());     // Must be after clerkMiddleware for JSON parsing

// Sample route
app.get('/', (req, res) => {
  res.send('API is working...');
}); 

// Webhook route (needs raw body)
app.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Educator routes
app.use('/api/educator', educatorRouter);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Add course endpoint: POST http://localhost:${PORT}/api/educator/add-course`);
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
