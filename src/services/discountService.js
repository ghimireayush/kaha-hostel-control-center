
import discountsData from '../data/discounts.json';

let discounts = [...discountsData];

export const discountService = {
  // Get all discounts
  async getDiscounts() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...discounts]), 100);
    });
  },

  // Get discount by ID
  async getDiscountById(id) {
    return new Promise((resolve) => {
      const discount = discounts.find(d => d.id === id);
      setTimeout(() => resolve(discount), 100);
    });
  },

  // Get discounts by student ID
  async getDiscountsByStudentId(studentId) {
    return new Promise((resolve) => {
      const studentDiscounts = discounts.filter(d => d.studentId === studentId);
      setTimeout(() => resolve(studentDiscounts), 100);
    });
  },

  // Apply new discount
  async applyDiscount(discountData) {
    return new Promise((resolve) => {
      const newDiscount = {
        id: `DIS${String(discounts.length + 1).padStart(3, '0')}`,
        ...discountData,
        appliedDate: new Date().toISOString().split('T')[0],
        appliedBy: 'Admin',
        status: 'Active'
      };
      discounts.push(newDiscount);
      setTimeout(() => resolve(newDiscount), 100);
    });
  },

  // Update discount status
  async updateDiscountStatus(id, status) {
    return new Promise((resolve) => {
      const index = discounts.findIndex(d => d.id === id);
      if (index !== -1) {
        discounts[index].status = status;
        setTimeout(() => resolve(discounts[index]), 100);
      } else {
        setTimeout(() => resolve(null), 100);
      }
    });
  },

  // Get discount statistics
  async getDiscountStats() {
    return new Promise((resolve) => {
      const stats = {
        totalDiscounts: discounts.reduce((sum, d) => sum + d.amount, 0),
        activeDiscounts: discounts.filter(d => d.status === 'Active').length,
        totalDiscountHistory: discounts.length
      };
      setTimeout(() => resolve(stats), 100);
    });
  },

  // Get discount reasons
  getDiscountReasons() {
    return [
      'Good behavior discount',
      'Early payment discount',
      'Referral bonus',
      'Financial hardship',
      'Long stay discount',
      'Sibling discount',
      'Academic excellence',
      'Custom reason'
    ];
  }
};
