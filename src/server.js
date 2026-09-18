const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Temporary memory storage
const urls = [];
let nextId = 1;

// Base62 characters
const BASE62_CHARACTERS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Convert numeric ID to Base62 short code
function encodeBase62(number) {
  if (number === 0) {
    return "0";
  }

  let shortCode = "";

  while (number > 0) {
    const remainder = number % 62;
    shortCode = BASE62_CHARACTERS[remainder] + shortCode;
    number = Math.floor(number / 62);
  }

  return shortCode;
}

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "URL Shortener API is running"
  });
});

// Health-check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "url-shortener"
  });
});

// Create a shortened URL
app.post("/api/urls", (req, res) => {
  const { longUrl } = req.body;

  // Validate that longUrl is a non-empty string
  if (typeof longUrl !== "string" || longUrl.trim() === "") {
    return res.status(400).json({
      error: "longUrl must be a non-empty string"
    });
  }

  // Remove extra spaces
  const cleanedUrl = longUrl.trim();

  // Validate URL format
  let parsedUrl;

  try {
    parsedUrl = new URL(cleanedUrl);
  } catch {
    return res.status(400).json({
      error: "Please provide a valid URL"
    });
  }

  // Allow only HTTP and HTTPS
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({
      error: "Only HTTP and HTTPS URLs are allowed"
    });
  }

  // Generate unique ID
  const id = nextId++;

  // Generate Base62 short code
  const shortCode = encodeBase62(id);

  // Create URL record
const urlData = {
  id,
  longUrl: cleanedUrl,
  shortCode,
  clickCount: 0,
  isActive: true,
  createdAt: new Date()
};


  // Save URL in temporary memory
  urls.push(urlData);

  // Send response
  res.status(201).json({
    message: "Short URL created successfully",
    data: {
      id: urlData.id,
      longUrl: urlData.longUrl,
      shortCode: urlData.shortCode,
      shortUrl: `http://localhost:${PORT}/${urlData.shortCode}`,
      clickCount: urlData.clickCount,
      createdAt: urlData.createdAt
    }
  });
});

// Get all shortened URLs
app.get("/api/urls", (req, res) => {
  res.json({
    count: urls.length,
    data: urls.map((url) => ({
      id: url.id,
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      shortUrl: `http://localhost:${PORT}/${url.shortCode}`,
      clickCount: url.clickCount,
      createdAt: url.createdAt
    }))
  });
});

// Get one shortened URL by ID
app.get("/api/urls/:id", (req, res) => {
  const id = Number(req.params.id);

  const urlData = urls.find((url) => url.id === id);

  if (!urlData) {
    return res.status(404).json({
      error: "URL not found"
    });
  }

  res.json({
    data: {
      id: urlData.id,
      longUrl: urlData.longUrl,
      shortCode: urlData.shortCode,
      shortUrl: `http://localhost:${PORT}/${urlData.shortCode}`,
      clickCount: urlData.clickCount,
      createdAt: urlData.createdAt
    }
  });
});

// Delete one shortened URL by ID
app.delete("/api/urls/:id", (req, res) => {
  const id = Number(req.params.id);

  const urlIndex = urls.findIndex((url) => url.id === id);

  if (urlIndex === -1) {
    return res.status(404).json({
      error: "URL not found"
    });
  }

  const deletedUrl = urls[urlIndex];

  urls.splice(urlIndex, 1);

  res.json({
    message: "Short URL deleted successfully",
    data: {
      id: deletedUrl.id,
      shortCode: deletedUrl.shortCode,
      longUrl: deletedUrl.longUrl
    }
  });
});

// Redirect short URL to original URL
// app.get("/:shortCode", (req, res) => {
//   const { shortCode } = req.params;

//   const urlData = urls.find((url) => url.shortCode === shortCode);

//   if (!urlData) {
//     return res.status(404).json({
//       error: "Short URL not found"
//     });
//   }

//   // Increase click count
//   urlData.clickCount += 1;

//   // Redirect to original URL
//   res.redirect(urlData.longUrl);
// });

app.patch("/api/urls/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      error: "isActive must be a boolean"
    });
  }

  const urlData = urls.find((url) => url.id === id);

  if (!urlData) {
    return res.status(404).json({
      error: "URL not found"
    });
  }

  urlData.isActive = isActive;

  res.json({
    message: isActive
      ? "Short URL activated successfully"
      : "Short URL deactivated successfully",
    data: {
      id: urlData.id,
      shortCode: urlData.shortCode,
      isActive: urlData.isActive
    }
  });
});


app.get("/:shortCode", (req, res) => {
  const { shortCode } = req.params;

  const urlData = urls.find((url) => url.shortCode === shortCode);

  if (!urlData) {
    return res.status(404).json({
      error: "Short URL not found"
    });
  }

  if (!urlData.isActive) {
    return res.status(403).json({
      error: "This short URL has been deactivated"
    });
  }

  urlData.clickCount += 1;

  res.redirect(urlData.longUrl);
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
