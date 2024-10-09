import mongoose from "mongoose";
import multer from "multer";
import path from "path";

// Expense Schema
const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "groceries",
        "rent",
        "utilities",
        "transportation",
        "entertainment",
        "other",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },
    created_by: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), "public/uploads")); // Ensure the uploads directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// CSV File Filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.csv') {
    return cb(new Error('Only CSV files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("csvFile"); 

// Expense Model
const expenseModel = mongoose.model("Expense", expenseSchema);
export default expenseModel;
