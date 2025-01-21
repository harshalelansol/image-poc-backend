const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

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

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Frontend URL
  },
});

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

    // Notify all connected Socket.IO clients
    io.emit("update", "Images Updated"); // Emit "update" event to all clients
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
