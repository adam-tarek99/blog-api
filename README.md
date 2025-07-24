# Blog API

Simple RESTful Blog API built with Node.js, Express, and MongoDB.  
Includes basic CRUD operations for users and blog posts, with validation and performance testing using autocannon.

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- Autocannon (for performance testing)

## Run Locally

1. Clone the project

```bash
git clone https://github.com/your-username/blog-api.git
cd blog-api

npm install

PORT=5000
MONGO_URI=your_mongo_connection_string

npm run dev
