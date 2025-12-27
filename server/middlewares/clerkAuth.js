// middlewares/clerkAuth.js
import { clerkClient } from '@clerk/clerk-sdk-node';

export const clerkAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Clerk
    const session = await clerkClient.verifyToken(token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user info to request
    req.auth = {
      userId: session.sub, // This is the Clerk user ID
      sessionId: session.sid,
      email: session.email
    };

    console.log('Authenticated user:', req.auth.userId);
    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};