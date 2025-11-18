import express from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

const router = express.Router();


router.post('/register', register);
router.post('/login', login);


router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, upload.single('avatar'), updateProfile);
router.post('/change-password', authMiddleware, changePassword);

export default router;
