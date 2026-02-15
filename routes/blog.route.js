const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { protect, optionalProtect } = require('../middlewares/auth.middleware');

// Protected route for getting own blogs (must be before /:id)
router.get('/me', protect, blogController.getMyBlogs);

// Public routes (if you want everyone to see all blogs)
router.get('/', blogController.getAllBlogs);
router.get('/:id', optionalProtect, blogController.getBlogById);

// Protected routes (require login)
router.use(protect); // Apply 'protect' middleware to all routes below

router.post('/', blogController.createBlog);
router.patch('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);


module.exports = router;
