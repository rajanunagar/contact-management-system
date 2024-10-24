const express = require('express');
const router = express.Router();
const { getContactsByUserId, createContact, updateContactById, deleteContactById, getContactById, bulkImportContact } = require('../controllers/contactController');
const validateToken = require('../middlewares/validateToken');

router.use(validateToken);

router.route('/').get(getContactsByUserId).post(createContact);
router.route('/:id').get(getContactById).put(updateContactById).delete(deleteContactById);
router.route('/bulkimport').post(bulkImportContact);

module.exports = router;    