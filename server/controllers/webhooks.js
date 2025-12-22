import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    await whook.venify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })
    const { data, type } = req.body


    switch (type) {
      case 'user.creted': {
        const userData = {
          _id: data.id,
          email: data.email_address[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url
        }
        await User.create(userData)
        res.JSON({})
        break;
      }
      case 'user.updated': {
        const userData = {
          email: data.email_address[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url
        }

        await User.findByIdAndUpdate(data.id, userData)
        res.JSON({})
        break;
      }
      case 'user.deletd': {
        await User.findByIdAndDelet(data.id)
        res.JSON({})
        break;
      }
      default:
        break;
    }

  } catch (error) {
    res.JSON({ success: false, messege: error.messege })
  }
}