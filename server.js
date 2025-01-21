const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(
  "/images",
  express.static(path.join("C:/Users/elans/OneDrive/Desktop/images_poc"))
);

// API endpoint to list all images
app.get("/api/images", (req, res) => {
  const imageDir = path.join("C:/Users/elans/OneDrive/Desktop/images_poc");

  fs.readdir(imageDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ error: "Unable to fetch images" });
    }

    // Filter out non-image files (optional)
    const imagePaths = files
      .filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".jpeg")
      )
      .map((file) => `/images/${file}`);

    res.json(imagePaths); // Return the array of image paths
  });
});

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

// Watch for changes in the image directory
const imageDir = path.join("C:/Users/elans/OneDrive/Desktop/images_poc");

fs.watch(imageDir, (eventType, filename) => {
  if (
    filename &&
    (filename.endsWith(".jpg") ||
      filename.endsWith(".png") ||
      filename.endsWith(".jpeg"))
  ) {
    console.log("Image folder changed:", filename);

    // Notify all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("update");
      }
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
