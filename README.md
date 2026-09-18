# 🔗 URL Shortener API

A lightweight REST API that converts long URLs into short, shareable links using Base62 encoding.

This project is built with Node.js and Express.js to understand backend fundamentals such as API design, URL validation, redirects, click tracking, HTTP status codes, and CRUD operations.

## ✨ Features

- Create shortened URLs
- Generate unique short codes using Base62 encoding
- Redirect short URLs to original URLs
- Track click counts
- List all shortened URLs
- Get a shortened URL by ID
- Delete shortened URLs
- Validate input URLs
- Allow only HTTP and HTTPS URLs
- Health-check endpoint
- Proper HTTP status codes and error responses

## 🛠️ Tech Stack

- Node.js
- Express.js
- JavaScript
- REST API
- Git and GitHub

## 📁 Project Structure

```text
url-shortener/
│
├── src/
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

