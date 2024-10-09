import express from "express";
import cors from "cors";
import path from "path"; 
import constant from "./config/constant.js";
import db from "./config/db.js";
import indexRoutes from "./routes/indexRoutes.js";

const app = express();
const port = constant.PORT;

// CORS middleware
app.use(cors());

// For JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path resolver
app.use(express.static(path.resolve(process.cwd(), "public")));

// Create server
app.listen(port, () => {
  console.log(`Server running on Port ${port}.`);
  db();
});

// API routes
app.use("/api", indexRoutes);
