const { Router } = require('express')

const { authenticated } = require('../middlewares/auth')
const adminController = require('../controllers/adminController')

const router = Router()

/**
 * @route GET /dashboard
 * @description Dashboard page
 */
router.get('/', authenticated, adminController.dashboard)

/**
 * @route GET /dashboard/add-post
 * @description Dashboard Add Post Page
 */
router.get('/add-post', authenticated, adminController.getAddPosts)

/**
 * @route GET /dashboard/add-category
 * @description Dashboard Add Category Page
 */
router.get('/add-category', authenticated, adminController.getAddCategory)

/**
 * @route GET /dashboard/image-galllery
 * @description Dashboard Image Gallery Page
 */
router.get('/image-gallery', authenticated, adminController.imageGallery)

/**
 * @route GET /dashboard/edit-post/:id
 * @description Dashboard Edit Post Page
 */
router.get('/edit-post/:id', authenticated, adminController.getEditPost)

/**
 * @route GET /dashboard/delete-post/:id
 * @description Dashboard Delte Post Page
 */
router.get('/delete-post/:id', authenticated, adminController.deletePost)

/**
 * @route POST /dashboard/add-post
 * @description Dashboard Add Post Handler
 */
router.post('/add-post', authenticated, adminController.createPost)

/**
 * @route POST /dashboard/edit-post/:id
 * @description Dashboard Edit Post Handler
 */
router.post('/edit-post/:id', authenticated, adminController.editPost)

/**
 * @route POST /dashboard/image-upload
 * @description Dashboard Handle Image Upload
 */
router.post('/image-upload', authenticated, adminController.uploadImage)

/**
 * @route POST /dashboard/search
 * @description Dashboard Handle Search
 */
router.post('/search', authenticated, adminController.handleDashboardSearch)

module.exports = router
