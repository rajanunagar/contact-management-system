const contactJoiSchema = require('../joiModel/contactJoiSchema');
const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');
const {applyPaginationAndFilterOnList} = require('../common/function');

const codes = ['91', '61', '1', '44', '92', '27', '86', '94', '81', '49', '33', '39', '55', '52', '7', '64', '82', '65', '66', '90', '966', '971', '62', '60', '63', '84', '20', '234', '254', '57', '54', '56', '51'];

const isValidCode = (code) => codes.includes(code);

const validateContact = async (contact) => {
    if (!isValidCode(contact.code) && contact.phonecategory !== 'Emergency') {
        throw new Error("Code is not valid");
    }
    if (contact.phonecategory === 'Emergency' && contact.code) {
        throw new Error("Emergency number don't have code");
    }
    await contactJoiSchema.validateAsync(contact);
};

const checkDuplicatePhoneNo = async (userId, phoneNo, excludeId) => {
    const contactResponse = await Contact.findOne({ $and: [{ userid: userId }, { phoneno: phoneNo }] });
    if (contactResponse && (!excludeId || (excludeId && excludeId !== contactResponse._id.toString()))) {
        throw new Error(`PhoneNo already occupied by ${contactResponse.fullname}`);
    }
};

const getContactsByUserId = asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 10);
    const name = req.query.name;
    const offset = (page - 1) * size;
    let contacts;
    let totalRecords;
    let query = Contact.find({ userid: req.user.id });

    if (page === -1) {
        //without pagination
        contacts = await query;
        totalRecords = contacts.length;
    } else {
        //with pagination
        const result = await applyPaginationAndFilterOnList(query,size,offset,name,page);
        contacts=result.list;
        totalRecords=result.totalRecords;
    }
    res.status(200).json({ contacts: contacts, length: totalRecords });
});

const getContactById = asyncHandler(async (req, res) => {
    if (req.params.id.length !== 24) {
        res.status(404);
        throw new Error('Contact not found');
    }
    const contactResponse = await Contact.findById(req.params.id);
    if (!contactResponse) {
        res.status(404);
        throw new Error('Contact not found');
    }
    res.status(200).json(contactResponse);
});

const createContact = asyncHandler(async (req, res) => {
    const contact = req.body;
    await validateContact(contact);
    await checkDuplicatePhoneNo(req.user.id, contact.phoneno, '');
    contact.userid = req.user.id;
    try {
        const contactResponse = await Contact.create(contact);
        res.status(201).json(contactResponse);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const updateContactById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const contact = req.body;
    await validateContact(contact);
    let contactResponse = await Contact.findById(id);
    if (!contactResponse) {
        res.status(404);
        throw new Error('Contact Not Found');
    }
    if (contactResponse.userid.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User doesn't have permission to update other user contacts");
    }
    await checkDuplicatePhoneNo(req.user.id, contact.phoneno, id);
    contact.userid = req.user.id;
    const updatedContact = await Contact.findByIdAndUpdate(id, contact, { new: true });
    res.status(200).json(updatedContact);
});

const deleteContactById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (id.length !== 24) {
        res.status(404);
        throw new Error('Contact not found');
    }
    const contactResponse = await Contact.findById(id);
    if (!contactResponse) {
        res.status(404);
        throw new Error('Contact Not Found');
    }
    if (contactResponse.userid.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User doesn't have permission to delete other user contacts");
    }
    await Contact.deleteOne({ _id: id });
    res.status(200).json(contactResponse);
});

const bulkImportContact = asyncHandler(async (req, res) => {
    const contacts = req.body;
    const responseArray = [];
    let success = 0;
    for (const contact of contacts) {
        try {
            await validateContact(contact);
            await checkDuplicatePhoneNo(req.user.id, contact.phoneno, '');

            contact.userid = req.user.id;
            await Contact.create(contact);
            responseArray.push({ ...contact, status: 'success' });
            success++;
        } catch (error) {
            responseArray.push({ ...contact, status: error.message });
        }
    }
    res.status(200).json({ data: responseArray, success: success });
});

module.exports = { getContactsByUserId, createContact, updateContactById, deleteContactById, getContactById, bulkImportContact };















// const contactJoiSchema = require('../joiModel/contactJoiSchema');
// const asyncHandler = require('express-async-handler');
// const Contact = require('../models/contactModel');

// const codes = ['91', '61', '1', '44', '92', '27', '86', '94', '81', '49', '33', '39', '55', '52', '7', '64', '82', '65', '66', '90', '966', '971', '62', '60', '63', '84', '20', '234', '254', '57', '54', '56', '51'];

// const getContactsByUserId = asyncHandler(async (req, res) => {

//     const page = Number(req.query.page ? req.query.page : 1);
//     const size = Number(req.query.size ? req.query.size : 10);
//     const name = req.query.name;
//     const offset = (page - 1) * size;
//     let contacts;
//     let totalRecords;
//     let query = Contact.find({ userid: req.user.id });

//     if (page === -1) {
//         contacts = await query;
//         totalRecords = contacts.length;
//     }
//     else {
//         const result = await query;
//         const filtered = result.filter(target => {
//             if (!name) {
//                 return target;
//             }
//             else if (target.fullname.toLowerCase().includes(name.toLowerCase())) {
//                 return target;
//             }
//             else return false;
//         })
//         const totalPages = Math.ceil(filtered.length / size);
//         if (!totalPages) {
//             res.status(400);
//             throw new Error('No Record Found');
//         }
//         if (page > totalPages) {
//             res.status(400);
//             throw new Error('Page Not Found');
//         }
//         contacts = filtered.slice(offset, offset + size);
//         totalRecords = filtered.length;
//     }
//     res.status(200).json({ contacts: contacts, length: totalRecords });
// });

// const getContactById = asyncHandler(async (req, res) => {
//     if (req.params.id.length !== 24) {
//         res.status(404);
//         throw new Error('Contact not found');
//     }
//     const contactResponse = await Contact.findById(req.params.id);
//     if (!contactResponse) {
//         res.status(404);
//         throw new Error('Contact not found');
//     }
//     res.status(200).json(contactResponse);
// });

// const createContact = asyncHandler(async (req, res) => {
//     const contact = req.body;
//     if (!isValidCode(contact.code) && contact.phonecategory !== 'Emergency') {
//         throw new Error("Code is not valid");
//     }
//     if (contact.phonecategory === 'Emergency' && contact.code) {
//         throw new Error("Emergency number don't have code");
//     }
//     await contactJoiSchema.validateAsync(contact);

//     let contactResponse = await Contact.findOne({ $and: [{ userid: req.user.id }, { phoneno: contact.phoneno }] });
//     if (contactResponse) {
//         res.status(400);
//         throw new Error(`PhoneNo already occupied by ${contactResponse.fullname}`);
//     }
//     contact.userid = req.user.id;
//     try {
//         contactResponse = await Contact.create(contact);
//     }
//     catch (error) {
//         res.status(400);
//         throw new Error(error);
//     }

//     res.status(201).json(contactResponse);
// });

// const updateContactById = asyncHandler(async (req, res) => {
//     const id = req.params.id;
//     const contact = req.body;
//     if (!isValidCode(contact.code) && contact.phonecategory !== 'Emergency') {
//         throw new Error("Code is not valid");
//     }
//     if (contact.phonecategory === 'Emergency' && contact.code) {
//         throw new Error("Emergency number don't have code");
//     }
//     await contactJoiSchema.validateAsync(contact);

//     let contactResponse = await Contact.findById(id);
//     if (!contactResponse) {
//         res.status(404);
//         throw new Error('Contact Not Found');
//     }
//     if (contactResponse.userid.toString() !== req.user.id) {
//         res.status(403);
//         throw new Error("User don't have permission to update other user contacts");
//     }
//     contactResponse = await Contact.findOne({ $and: [{ userid: req.user.id }, { phoneno: contact.phoneno }] });
//     if (contactResponse && contactResponse._id.toString() !== req.params.id) {
//         res.status(400);
//         throw new Error(`PhoneNo already occupied by ${contactResponse.fullname}`);
//     }
//     contact.userid = req.user.id;
//     const updatedContact = await Contact.findByIdAndUpdate(
//         id,
//         contact,
//         { new: true }
//     );

//     res.status(200).json(updatedContact);

// });

// const deleteContactById = asyncHandler(async (req, res) => {
//     const id = req.params.id;
//     if (id.length !== 24) {
//         res.status(404);
//         throw new Error('Contact not found');
//     }
//     let contactResponse = await Contact.findById(id);
//     if (!contactResponse) {
//         res.status(404);
//         throw new Error('Contact Not Found');
//     }
//     if (contactResponse.userid.toString() !== req.user.id) {
//         res.status(403);
//         throw new Error("User don't have permission to delete other user contacts");
//     }

//     await Contact.deleteOne({ _id: req.params.id });
//     res.status(200).json(contactResponse);
// });

// const bulkImportContact = asyncHandler(async (req, res) => {
//     const contacts = req.body;
//     const responseArray = [];
//     let success = 0;
//     for (let i = 0; i < contacts.length; i++) {
//         const contact = contacts[i];
//         try {
//             if (!isValidCode(contact.code) && contact.phonecategory !== 'Emergency') {
//                 throw new Error("Code is not valid");
//             }
//             if (contact.phonecategory === 'Emergency' && contact.code) {
//                 throw new Error("Emergency number don't have code");
//             }
//             await contactJoiSchema.validateAsync(contact);

//             let contactResponse = await Contact.findOne({ $and: [{ userid: req.user.id }, { phoneno: contact.phoneno }] });
//             if (contactResponse) {
//                 throw new Error(`PhoneNo already occupied by ${contactResponse.fullname}`);
//             }
//             contact.userid = req.user.id;
//             await Contact.create({ ...contact, userid: req.user.id });
//             responseArray.push({ ...contact, status: 'success' });
//             success++;
//         }
//         catch (error) {
//             // console.log(error);
//             responseArray.push({ ...contact, status: error.message });
//         }
//     }
//     res.status(200).json({ data: responseArray, success: success });
// });



// // const validateContactModel = async (contact) => {
// //     if (!isValidCode(contact.code) && contact.phonecategory !== 'Emergency') {
// //         throw new Error("Code is not valid");
// //     }
// //     if (contact.phonecategory === 'Emergency' && contact.code) {
// //         throw new Error("Emergency number don't have code");
// //     }
// // }

// const isValidCode = (code) => {
//     const obj = codes.find((rec) => rec === code);
//     return obj ? true : false;
// }

// module.exports = { getContactsByUserId, createContact, updateContactById, deleteContactById, getContactById, bulkImportContact };
