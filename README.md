# Image Upload API

This project is a Node.js application that demonstrates how to upload and store images using Express, Multer, and MongoDB.

## Features

- Upload single images
- Store image information in MongoDB
- Retrieve uploaded images
- Associate images with users

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed (version 12.x or higher)
- MongoDB installed and running
- npm or yarn package manager

## Installation

1. Clone the repository:


2. Install the dependencies:


3. Create a `.env` file in the root directory and add your MongoDB connection string:


## Usage

1. Start the server:


2. The server will start running on `http://localhost:3000` (or the port specified in your environment).

3. Use a tool like Postman to test the API endpoints:

- Upload an image:
  - POST `http://localhost:3000/user/uploadImage`
  - Use form-data with key "image" (type: File) and select an image file
  - Add key "userId" (type: Text) and provide a valid user ID

- Get user information (including image path):
  - GET `http://localhost:3000/user/:id`

## Project Structure

- `app.js`: Main application file
- `routes/userRoutes.js`: User-related routes including image upload
- `models/user.js`: User model schema
- `upload.js`: Multer configuration for file uploads
- `uploads/`: Directory where uploaded files are stored

## Contributing

Contributions to this project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Contact

If you have any questions, please contact [your-email@example.com].