const express = require("express");
const discountController = require("../controllers/discountController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Discount:
 *       type: object
 *       required:
 *         - studentId
 *         - amount
 *         - reason
 *       properties:
 *         id:
 *           type: string
 *           description: Unique discount identifier
 *         studentId:
 *           type: string
 *           description: ID of the student receiving the discount
 *         studentName:
 *           type: string
 *           description: Name of the student
 *         room:
 *           type: string
 *           description: Student's room number
 *         amount:
 *           type: number
 *           description: Discount amount in NPR
 *         reason:
 *           type: string
 *           description: Reason for the discount
 *         notes:
 *           type: string
 *           description: Additional notes about the discount
 *         appliedBy:
 *           type: string
 *           description: Who applied the discount
 *         date:
 *           type: string
 *           format: date
 *           description: Date when discount was applied
 *         status:
 *           type: string
 *           enum: [active, expired]
 *           description: Current status of the discount
 *         appliedTo:
 *           type: string
 *           description: Where the discount was applied (ledger)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the discount was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the discount was last updated
 */

/**
 * @swagger
 * /api/v1/discounts:
 *   get:
 *     summary: Get all discounts with optional filtering
 *     tags: [Discounts]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired]
 *         description: Filter by discount status
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *         description: Filter by discount reason
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discounts from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter discounts to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in student name, reason, or notes
 *     responses:
 *       200:
 *         description: List of discounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Discount'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 */
router.get("/", discountController.getDiscounts);

/**
 * @swagger
 * /api/v1/discounts/stats:
 *   get:
 *     summary: Get discount statistics
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: Discount statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalDiscounts:
 *                       type: number
 *                     activeDiscounts:
 *                       type: number
 *                     expiredDiscounts:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     totalActiveAmount:
 *                       type: number
 *                     totalExpiredAmount:
 *                       type: number
 *                     averageDiscount:
 *                       type: number
 *                     monthlyDiscounts:
 *                       type: number
 *                     monthlyAmount:
 *                       type: number
 *                     reasonStats:
 *                       type: object
 *                     recentDiscounts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Discount'
 */
router.get("/stats", discountController.getDiscountStats);

/**
 * @swagger
 * /api/v1/discounts/student/{studentId}:
 *   get:
 *     summary: Get discounts by student ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student discounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Discount'
 */
router.get("/student/:studentId", discountController.getDiscountsByStudentId);

/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   get:
 *     summary: Get discount by ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     responses:
 *       200:
 *         description: Discount retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *       404:
 *         description: Discount not found
 */
router.get("/:id", discountController.getDiscountById);

/**
 * @swagger
 * /api/v1/discounts:
 *   post:
 *     summary: Apply new discount
 *     tags: [Discounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - amount
 *               - reason
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student receiving the discount
 *               amount:
 *                 type: number
 *                 description: Discount amount in NPR
 *               reason:
 *                 type: string
 *                 description: Reason for the discount
 *               notes:
 *                 type: string
 *                 description: Additional notes about the discount
 *               appliedBy:
 *                 type: string
 *                 description: Who applied the discount
 *     responses:
 *       201:
 *         description: Discount applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     discount:
 *                       $ref: '#/components/schemas/Discount'
 *                     studentName:
 *                       type: string
 *                     newBalance:
 *                       type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request data
 */
router.post("/", discountController.applyDiscount);

/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   put:
 *     summary: Update discount
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, expired]
 *     responses:
 *       200:
 *         description: Discount updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *                 message:
 *                   type: string
 */
router.put("/:id", discountController.updateDiscount);

/**
 * @swagger
 * /api/v1/discounts/{id}/expire:
 *   post:
 *     summary: Expire discount
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     responses:
 *       200:
 *         description: Discount expired successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *                 message:
 *                   type: string
 */
router.post("/:id/expire", discountController.expireDiscount);

/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   delete:
 *     summary: Delete discount
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Discount ID
 *     responses:
 *       200:
 *         description: Discount deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Discount'
 *                 message:
 *                   type: string
 */
router.delete("/:id", discountController.deleteDiscount);

module.exports = router;