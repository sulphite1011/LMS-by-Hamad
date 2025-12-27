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

// app completed by video now its up to me




  
  // Log all registered routes
  console.log('\n=== REGISTERED ROUTES ===');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods);
      console.log(`${methods.join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      // Routes registered as router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          console.log(`${methods.join(', ').toUpperCase()} /api/educator${handler.route.path}`);
        }
      });
    }
  });
  console.log('=== END ROUTES ===\n');
