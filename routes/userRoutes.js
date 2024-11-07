const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const upload = require('../middleware/upload'); // importing the middleware here

const router = express.Router();

// Create a new user
router.post('/create', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user details
router.put('/edit', async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User cannot be updated ' });
    }

    if (fullName) user.fullName = fullName;
    if (password) {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must meet complexity requirements' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/delete', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await User.findOneAndDelete({ email });
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Retrieve all users
router.get('/getAll', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email password imagePath');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to upload an image
router.post('/uploadImage', upload.single('image'), async (req, res) => {
    try {
        // Check if user ID is present and valid
        const username = req.body.username;
        //console.log(req.file.filename)
        console.log(username)
        if (!username) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Validate user in the database
        const user = await User.findOne({fullName:username});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if file exists in the request
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the file path to the user's profile in the database
        const filePath = `images/${req.file.filename}`;
        console.log("filePath" + filePath)
        const result = await User.updateOne(
          { fullName: username }, 
          { $set: { imagePath: filePath } } // Set the new field
      );
        await user.save();

        res.status(200).json({
            message: 'Image uploaded successfully',
            filePath: filePath
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
module.exports = router;