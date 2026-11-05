const express = require('express');
const multer = require('multer');
const { getToCutReport, uploadToCutReport } = require('../controllers/tocutReportController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const valid = /\.(xlsx|xls)$/i.test(file.originalname);
    cb(valid ? null : new Error('Sirf .xlsx ya .xls Excel file upload karein.'), valid);
  },
});

router.get('/', getToCutReport);
router.post('/upload', upload.single('file'), uploadToCutReport);

module.exports = router;
