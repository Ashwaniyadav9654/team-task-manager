const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password').sort('name');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'No image provided' });

    const user = await User.findById(req.user._id);

    // Delete old avatar
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }

    const result = await cloudinary.uploader.upload(avatar, {
      folder: 'team-task-manager/avatars',
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto'
    });

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({ message: 'Avatar updated', avatar: result.secure_url, user });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};
