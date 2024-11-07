const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const upload = require('../middleware/upload'); // Import middleware for file uploads

const router = express.Router();

// Validation function for password
function isPasswordValid(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  return passwordRegex.test(password);
}

// Validation function for full name
function isFullNameValid(fullName) {
  return /^[A-Z]/.test(fullName);
}

// Validation function for email (checks if Gmail and no match with fullName)
function isEmailValid(email, fullName) {
  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const doesNotMatchFullName = fullName.toLowerCase() !== email.split('@')[0].toLowerCase();
  return isGmail && doesNotMatchFullName;
}

// Create a new user
router.post('/create', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Full name validation
    if (!isFullNameValid(fullName)) {
      return res.status(400).json({ message: 'Full name must start with a capital letter.' });
    }

    // Email validation
    if (!isEmailValid(email, fullName)) {
      return res.status(400).json({ message: 'Email must be a Gmail address and not match the full name.' });
    }

    // Password validation
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Hash password and create new user
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
      return res.status(404).json({ message: 'User not found.' });
    }

    if (fullName && !isFullNameValid(fullName)) {
      return res.status(400).json({ message: 'Full name must start with a capital letter.' });
    }
    
    if (password && !isPasswordValid(password)) {
      return res.status(400).json({ message: 'Password must meet complexity requirements.' });
    }

    if (fullName) user.fullName = fullName;
    if (password) user.password = await bcrypt.hash(password, 10);

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

// Upload an image for a user
router.post('/uploadImage', upload.single('image'), async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ fullName: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `images/${req.file.filename}`;
    user.imagePath = filePath;
    await user.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      filePath: filePath
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;