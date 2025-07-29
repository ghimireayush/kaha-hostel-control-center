const discountService = require("../services/discountService");

/**
 * Get all discounts with optional filtering
 */
async function getDiscounts(req, res) {
  try {
    console.log("📊 GET /discounts - Fetching discounts with filters:", req.query);
    
    const filters = {
      studentId: req.query.studentId,
      status: req.query.status,
      reason: req.query.reason,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      search: req.query.search
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });
    
    const discounts = await discountService.getDiscounts(filters);
    
    console.log(`✅ Found ${discounts.length} discounts`);
    
    res.status(200).json({
      status: 200,
      result: {
        items: discounts,
        pagination: {
          total: discounts.length,
          page: 1,
          limit: discounts.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error("❌ Error fetching discounts:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to fetch discounts",
      message: error.message
    });
  }
}

/**
 * Get discount by ID
 */
async function getDiscountById(req, res) {
  try {
    const { id } = req.params;
    console.log(`📊 GET /discounts/${id} - Fetching discount by ID`);
    
    const discount = await discountService.getDiscountById(id);
    
    if (!discount) {
      return res.status(404).json({
        status: 404,
        error: "Discount not found"
      });
    }
    
    console.log("✅ Discount found:", discount.id);
    
    res.status(200).json({
      status: 200,
      data: discount
    });
  } catch (error) {
    console.error("❌ Error fetching discount by ID:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to fetch discount",
      message: error.message
    });
  }
}

/**
 * Apply new discount
 */
async function applyDiscount(req, res) {
  try {
    console.log("📊 POST /discounts - Applying new discount:", req.body);
    
    const { studentId, amount, reason, notes, appliedBy } = req.body;
    
    // Validate required fields
    if (!studentId || !amount || !reason) {
      return res.status(400).json({
        status: 400,
        error: "Missing required fields",
        message: "studentId, amount, and reason are required"
      });
    }
    
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        status: 400,
        error: "Invalid amount",
        message: "Discount amount must be greater than 0"
      });
    }
    
    const result = await discountService.applyDiscount({
      studentId,
      amount: parseFloat(amount),
      reason,
      notes,
      appliedBy: appliedBy || "Admin"
    });
    
    console.log("✅ Discount applied successfully:", result.discount.id);
    
    res.status(201).json({
      status: 201,
      data: result,
      message: `Discount of ₨${amount} applied successfully to ${result.studentName}`
    });
  } catch (error) {
    console.error("❌ Error applying discount:", error);
    res.status(400).json({
      status: 400,
      error: "Failed to apply discount",
      message: error.message
    });
  }
}

/**
 * Update discount
 */
async function updateDiscount(req, res) {
  try {
    const { id } = req.params;
    console.log(`📊 PUT /discounts/${id} - Updating discount:`, req.body);
    
    const updatedDiscount = await discountService.updateDiscount(id, req.body);
    
    console.log("✅ Discount updated successfully:", updatedDiscount.id);
    
    res.status(200).json({
      status: 200,
      data: updatedDiscount,
      message: "Discount updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating discount:", error);
    res.status(400).json({
      status: 400,
      error: "Failed to update discount",
      message: error.message
    });
  }
}

/**
 * Expire discount
 */
async function expireDiscount(req, res) {
  try {
    const { id } = req.params;
    console.log(`📊 POST /discounts/${id}/expire - Expiring discount`);
    
    const expiredDiscount = await discountService.expireDiscount(id);
    
    console.log("✅ Discount expired successfully:", expiredDiscount.id);
    
    res.status(200).json({
      status: 200,
      data: expiredDiscount,
      message: "Discount expired successfully"
    });
  } catch (error) {
    console.error("❌ Error expiring discount:", error);
    res.status(400).json({
      status: 400,
      error: "Failed to expire discount",
      message: error.message
    });
  }
}

/**
 * Delete discount
 */
async function deleteDiscount(req, res) {
  try {
    const { id } = req.params;
    console.log(`📊 DELETE /discounts/${id} - Deleting discount`);
    
    const deletedDiscount = await discountService.deleteDiscount(id);
    
    console.log("✅ Discount deleted successfully:", deletedDiscount.id);
    
    res.status(200).json({
      status: 200,
      data: deletedDiscount,
      message: "Discount deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting discount:", error);
    res.status(400).json({
      status: 400,
      error: "Failed to delete discount",
      message: error.message
    });
  }
}

/**
 * Get discount statistics
 */
async function getDiscountStats(req, res) {
  try {
    console.log("📊 GET /discounts/stats - Fetching discount statistics");
    
    const stats = await discountService.getDiscountStats();
    
    console.log("✅ Discount stats fetched successfully");
    
    res.status(200).json({
      status: 200,
      stats: stats
    });
  } catch (error) {
    console.error("❌ Error fetching discount stats:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to fetch discount statistics",
      message: error.message
    });
  }
}

/**
 * Get discounts by student ID
 */
async function getDiscountsByStudentId(req, res) {
  try {
    const { studentId } = req.params;
    console.log(`📊 GET /discounts/student/${studentId} - Fetching discounts for student`);
    
    const discounts = await discountService.getDiscountsByStudentId(studentId);
    
    console.log(`✅ Found ${discounts.length} discounts for student ${studentId}`);
    
    res.status(200).json({
      status: 200,
      data: discounts
    });
  } catch (error) {
    console.error("❌ Error fetching discounts by student ID:", error);
    res.status(500).json({
      status: 500,
      error: "Failed to fetch student discounts",
      message: error.message
    });
  }
}

module.exports = {
  getDiscounts,
  getDiscountById,
  applyDiscount,
  updateDiscount,
  expireDiscount,
  deleteDiscount,
  getDiscountStats,
  getDiscountsByStudentId
};