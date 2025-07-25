
import hostelProfileData from '../data/hostelProfile.json' with { type: 'json' };

let hostelProfile = { ...hostelProfileData };

export const hostelService = {
  // Get hostel profile
  async getHostelProfile() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...hostelProfile }), 100);
    });
  },

  // Update hostel profile
  async updateHostelProfile(updates) {
    return new Promise((resolve) => {
      hostelProfile = { ...hostelProfile, ...updates };
      setTimeout(() => resolve({ ...hostelProfile }), 100);
    });
  },

  // Get hostel amenities
  async getAmenities() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(hostelProfile.amenities), 100);
    });
  },

  // Update amenities
  async updateAmenities(amenities) {
    return new Promise((resolve) => {
      hostelProfile.amenities = amenities;
      setTimeout(() => resolve(hostelProfile.amenities), 100);
    });
  },

  // Get pricing structure
  async getPricing() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(hostelProfile.pricing), 100);
    });
  },

  // Update pricing
  async updatePricing(pricing) {
    return new Promise((resolve) => {
      hostelProfile.pricing = { ...hostelProfile.pricing, ...pricing };
      setTimeout(() => resolve(hostelProfile.pricing), 100);
    });
  },

  // Get policies
  async getPolicies() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(hostelProfile.policies), 100);
    });
  },

  // Update policies
  async updatePolicies(policies) {
    return new Promise((resolve) => {
      hostelProfile.policies = { ...hostelProfile.policies, ...policies };
      setTimeout(() => resolve(hostelProfile.policies), 100);
    });
  }
};
