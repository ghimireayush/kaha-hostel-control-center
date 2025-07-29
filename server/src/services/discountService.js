const fs = require("fs").promises;
const path = require("path");

// Path to data files
const DISCOUNT_DATA_PATH = path.join(__dirname, "../data/discounts.json");
const STUDENT_DATA_PATH = path.join(__dirname, "../data/students.json");
const LEDGER_DATA_PATH = path.join(__dirname, "../data/ledger.json");

/**
 * Read data from file
 */
async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

/**
 * Write data to file
 */
async function writeDataFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

/**
 * Generate unique discount ID
 */
function generateDiscountId() {
  return `DISC${Date.now()}`;
}

/**
 * Get all discounts with optional filtering
 */
async function getDiscounts(filters = {}) {
  try {
    let discounts = await readDataFile(DISCOUNT_DATA_PATH);
    
    // Apply filters
    if (filters.studentId) {
      discounts = discounts.filter(d => d.studentId === filters.studentId);
    }
    
    if (filters.status) {
      discounts = discounts.filter(d => d.status === filters.status);
    }
    
    if (filters.reason) {
      discounts = discounts.filter(d => 
        d.reason.toLowerCase().includes(filters.reason.toLowerCase())
      );
    }
    
    if (filters.dateFrom) {
      discounts = discounts.filter(d => new Date(d.date) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      discounts = discounts.filter(d => new Date(d.date) <= new Date(filters.dateTo));
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      discounts = discounts.filter(d => 
        d.studentName.toLowerCase().includes(searchTerm) ||
        d.reason.toLowerCase().includes(searchTerm) ||
        d.notes.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by date (newest first)
    discounts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return discounts;
  } catch (error) {
    console.error("Error getting discounts:", error);
    throw error;
  }
}

/**
 * Get discount by ID
 */
async function getDiscountById(id) {
  try {
    const discounts = await readDataFile(DISCOUNT_DATA_PATH);
    return discounts.find(d => d.id === id);
  } catch (error) {
    console.error("Error getting discount by ID:", error);
    throw error;
  }
}

/**
 * Apply new discount
 */
async function applyDiscount(discountData) {
  try {
    const { studentId, amount, reason, notes, appliedBy } = discountData;
    
    // Validate required fields
    if (!studentId || !amount || !reason) {
      throw new Error("Missing required fields: studentId, amount, reason");
    }
    
    if (amount <= 0) {
      throw new Error("Discount amount must be greater than 0");
    }
    
    // Get student details
    const students = await readDataFile(STUDENT_DATA_PATH);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Check for duplicate active discounts of the same type
    const existingDiscounts = await readDataFile(DISCOUNT_DATA_PATH);
    const duplicateDiscount = existingDiscounts.find(d => 
      d.studentId === studentId && 
      d.reason === reason && 
      d.status === 'active'
    );
    
    if (duplicateDiscount) {
      throw new Error(`Active discount for "${reason}" already exists for this student`);
    }
    
    // Create new discount record
    const newDiscount = {
      id: generateDiscountId(),
      studentId,
      studentName: student.name,
      room: student.roomNumber,
      amount: parseFloat(amount),
      reason,
      notes: notes || "",
      appliedBy: appliedBy || "Admin",
      date: new Date().toISOString().split('T')[0],
      status: "active",
      appliedTo: "ledger",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to discounts
    existingDiscounts.push(newDiscount);
    await writeDataFile(DISCOUNT_DATA_PATH, existingDiscounts);
    
    // Create ledger entry for the discount
    const ledgerEntries = await readDataFile(LEDGER_DATA_PATH);
    const newLedgerEntry = {
      id: `LED${Date.now()}`,
      studentId,
      studentName: student.name,
      type: "Discount",
      description: `Discount: ${reason}`,
      debit: 0,
      credit: parseFloat(amount),
      balance: 0, // Will be calculated by ledger service
      date: new Date().toISOString().split('T')[0],
      referenceId: newDiscount.id,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ledgerEntries.push(newLedgerEntry);
    await writeDataFile(LEDGER_DATA_PATH, ledgerEntries);
    
    // Update student balance
    const currentBalance = student.currentBalance || 0;
    const updatedBalance = Math.max(0, currentBalance - parseFloat(amount));
    
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      students[studentIndex].currentBalance = updatedBalance;
      students[studentIndex].updatedAt = new Date().toISOString();
      await writeDataFile(STUDENT_DATA_PATH, students);
    }
    
    console.log(`✅ Discount applied: ₨${amount} to ${student.name} (${reason})`);
    
    return {
      success: true,
      discount: newDiscount,
      studentName: student.name,
      newBalance: updatedBalance
    };
    
  } catch (error) {
    console.error("❌ Error applying discount:", error);
    throw error;
  }
}

/**
 * Update discount
 */
async function updateDiscount(id, updateData) {
  try {
    const discounts = await readDataFile(DISCOUNT_DATA_PATH);
    const discountIndex = discounts.findIndex(d => d.id === id);
    
    if (discountIndex === -1) {
      throw new Error("Discount not found");
    }
    
    // Update discount
    discounts[discountIndex] = {
      ...discounts[discountIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await writeDataFile(DISCOUNT_DATA_PATH, discounts);
    
    return discounts[discountIndex];
  } catch (error) {
    console.error("Error updating discount:", error);
    throw error;
  }
}

/**
 * Expire/deactivate discount
 */
async function expireDiscount(id) {
  try {
    return await updateDiscount(id, { status: "expired" });
  } catch (error) {
    console.error("Error expiring discount:", error);
    throw error;
  }
}

/**
 * Delete discount
 */
async function deleteDiscount(id) {
  try {
    const discounts = await readDataFile(DISCOUNT_DATA_PATH);
    const discountIndex = discounts.findIndex(d => d.id === id);
    
    if (discountIndex === -1) {
      throw new Error("Discount not found");
    }
    
    const deletedDiscount = discounts.splice(discountIndex, 1)[0];
    await writeDataFile(DISCOUNT_DATA_PATH, discounts);
    
    return deletedDiscount;
  } catch (error) {
    console.error("Error deleting discount:", error);
    throw error;
  }
}

/**
 * Get discount statistics
 */
async function getDiscountStats() {
  try {
    const discounts = await readDataFile(DISCOUNT_DATA_PATH);
    
    const activeDiscounts = discounts.filter(d => d.status === 'active');
    const expiredDiscounts = discounts.filter(d => d.status === 'expired');
    
    const totalActiveAmount = activeDiscounts.reduce((sum, d) => sum + d.amount, 0);
    const totalExpiredAmount = expiredDiscounts.reduce((sum, d) => sum + d.amount, 0);
    const totalAmount = totalActiveAmount + totalExpiredAmount;
    
    // Group by reason
    const reasonStats = {};
    discounts.forEach(d => {
      if (!reasonStats[d.reason]) {
        reasonStats[d.reason] = { count: 0, amount: 0 };
      }
      reasonStats[d.reason].count++;
      reasonStats[d.reason].amount += d.amount;
    });
    
    // Monthly stats (current month)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyDiscounts = discounts.filter(d => d.date.startsWith(currentMonth));
    const monthlyAmount = monthlyDiscounts.reduce((sum, d) => sum + d.amount, 0);
    
    return {
      totalDiscounts: discounts.length,
      activeDiscounts: activeDiscounts.length,
      expiredDiscounts: expiredDiscounts.length,
      totalAmount,
      totalActiveAmount,
      totalExpiredAmount,
      averageDiscount: discounts.length > 0 ? Math.round(totalAmount / discounts.length) : 0,
      monthlyDiscounts: monthlyDiscounts.length,
      monthlyAmount,
      reasonStats,
      recentDiscounts: discounts.slice(0, 5) // Last 5 discounts
    };
  } catch (error) {
    console.error("Error getting discount stats:", error);
    throw error;
  }
}

/**
 * Get discounts by student ID
 */
async function getDiscountsByStudentId(studentId) {
  try {
    return await getDiscounts({ studentId });
  } catch (error) {
    console.error("Error getting discounts by student ID:", error);
    throw error;
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