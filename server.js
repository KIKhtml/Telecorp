const express = require("express");
const mysql = require("mysql");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mysql_nodejs",
});

// Check connection to the database
connection.connect((err) => {
  if (err) {
    console.log("Error connecting to the database:", err);
    return;
  }
  console.log("Successfully Connected");
});

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Add product
app.post("/addProd", upload.single("img_name"), (req, res) => {
  const { code, name, price } = req.body;

  if (!req.file) {
    console.log("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  const imageName = req.file.filename;
  const imagePath = req.file.path;

  const sql =
    "INSERT INTO products (code, name, price, img_name, img_path) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    sql,
    [code, name, price, imageName, imagePath],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .send("Error saving product and image to database.");
      }
      console.log("Database result:", result);
      res.send("Product and image details saved to database.");
    }
  );
});

// Read products
app.get("/pullProd", (req, res) => {
  connection.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.log(err);
      return res.status(400).send();
    }
    return res.status(200).json(results);
  });
});

// Read specific products
app.get("/getProd/:id", (req, res) => {
  const productId = req.params.id;
  const query = `SELECT * FROM products WHERE id = ${productId}`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Error querying database");
    }

    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }

    // Assuming there's only one product with the given ID, send it back
    const product = results[0];
    return res.status(200).json(product);
  });
});

// Update product
app.patch("/updateProd/:id", upload.single("img_name"), (req, res) => {
  const id = req.params.id;
  const { name, code, price } = req.body;
  const imgFile = req.file;

  let updateQuery = "UPDATE products SET name = ?, code = ?, price = ?";
  const queryParams = [name, code, price];

  if (imgFile) {
    const imageName = imgFile.filename;
    const imagePath = imgFile.path;
    updateQuery += ", img_name = ?, img_path = ?";
    queryParams.push(imageName, imagePath);
  }

  updateQuery += " WHERE id = ?";
  queryParams.push(id);

  connection.query(updateQuery, queryParams, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send();
    }
    return res.status(200).json({ message: "Detail updated !!" });
  });
});

// Delete product
app.delete("/deleteProd/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "DELETE FROM products WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      if (results.affectedRows === 0) {
        return res.status(404).send({ message: "Don't Have that product !!" });
      }
      return res.status(200).json({ message: "Product deleted !!" });
    }
  );
});

// Serve image by id
app.get("/image/:id", (req, res) => {
  const sql = "SELECT img_path FROM products WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).send("Error retrieving image path from database.");
    }
    if (result.length > 0) {
      res.sendFile(path.resolve(result[0].img_path));
    } else {
      res.send("Image not found.");
    }
  });
});

app.listen(3000, () => console.log("Server is running on port 3000"));
