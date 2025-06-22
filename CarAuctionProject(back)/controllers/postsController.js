const { models } = require('../utils/db');
const { Post, Customer } = models;
const Joi = require('joi');

// Validation schema
const createPostSchema = Joi.object({
  title: Joi.string().max(255).required().messages({
    'any.required': 'Title is required',
    'string.max': 'Title must not exceed 255 characters',
  }),
  description: Joi.string().allow('').optional(),
  userId: Joi.number().integer().required().messages({
    'any.required': 'User ID is required',
    'number.base': 'User ID must be a number',
  }),
});

// Get all posts with pagination
exports.getPosts = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const postsPerPage = 10;
    const offset = (parseInt(page) - 1) * postsPerPage;

    console.log('Fetching posts: page=', page, 'offset=', offset);
    const posts = await Post.findAll({
      limit: postsPerPage,
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['email'],
        },
      ],
    });

    console.log('Posts retrieved:', posts.length);
    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: posts,
    });
  } catch (error) {
    console.error('Error in getPosts:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single post by ID
exports.singlePost = async (req, res) => {
  try {
    const { postID } = req.query;

    if (!postID || isNaN(postID)) {
      console.log('Invalid postID:', postID);
      return res.status(400).json({ success: false, message: 'Valid post ID is required' });
    }

    console.log('Fetching post:', postID);
    const post = await Post.findOne({
      where: { postID },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['email'],
        },
      ],
    });

    if (!post) {
      console.log('Post not found:', postID);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    console.log('Post retrieved:', postID);
    return res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error in singlePost:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { userId } = req.user;

    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });

    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    console.log('Creating post for user:', userId);
    const customer = await Customer.findOne({ where: { customerID: userId } });
    if (!customer) {
      console.log('Customer not found:', userId);
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const post = await Post.create({
      title: value.title,
      description: value.description || null,
      customerID: userId,
    });

    console.log('Post created:', post.postID);
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error in createPost:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update an existing post
exports.updatePost = async (req, res) => {
  try {
    const { postID } = req.query;
    const { title, description } = req.body;
    const { userId } = req.user;

    if (!postID || isNaN(postID)) {
      console.log('Invalid postID:', postID);
      return res.status(400).json({ success: false, message: 'Valid post ID is required' });
    }

    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });

    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    console.log('Fetching post:', postID);
    const post = await Post.findOne({ where: { postID } });
    if (!post) {
      console.log('Post not found:', postID);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.customerID !== userId) {
      console.log('Unauthorized update attempt:', { postID, userId });
      return res.status(403).json({ success: false, message: 'Unauthorized to update this post' });
    }

    console.log('Updating post:', postID);
    await post.update({
      title: value.title,
      description: value.description || null,
    });

    console.log('Post updated:', postID);
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error in updatePost:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postID } = req.query;
    const { userId } = req.user;

    if (!postID || isNaN(postID)) {
      console.log('Invalid postID:', postID);
      return res.status(400).json({ success: false, message: 'Valid post ID is required' });
    }

    console.log('Fetching post:', postID);
    const post = await Post.findOne({ where: { postID } });
    if (!post) {
      console.log('Post not found:', postID);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.customerID !== userId) {
      console.log('Unauthorized delete attempt:', { postID, userId });
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
    }

    console.log('Deleting post:', postID);
    await post.destroy();

    console.log('Post deleted:', postID);
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error in deletePost:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};