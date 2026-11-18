import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db('fixmate');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  user:{
    additionalFields:{
        role:{
            type:["customer" , "technician" , "admin"],
            input:true,
            defaultValue:"customer",
        },
        phone:{ type:"string", required:false, input:true },
        area:{ type:"string", required:false, input:true },
        bio:{ type:"string", required:false, input:true },
    }
  },

  //...other options
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {},
});
