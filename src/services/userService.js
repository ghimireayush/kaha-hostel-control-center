// User Service - Staff and admin user management
import { apiService } from './apiService.ts';
import { API_ENDPOINTS } from '../config/api.ts';

export const userService = {
  // READ Operations
  async getAllUsers() {
    try {
      console.log('👥 Fetching users from API...');
      const result = await apiService.get(API_ENDPOINTS.USERS.BASE);
      console.log('✅ Users API response:', result);
      return result.items || result || [];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      console.log(`👥 Fetching user ${id} from API...`);
      const user = await apiService.get(API_ENDPOINTS.USERS.BY_ID(id));
      console.log('✅ User details fetched');
      return user;
    } catch (error) {
      console.error('❌ Error fetching user by ID:', error);
      throw error;
    }
  },

  async getUserByUsername(username) {
    return new Promise((resolve) => {
      const user = users.find(u => u.username === username);
      setTimeout(() => resolve(user), 100);
    });
  },

  async getUserByEmail(email) {
    return new Promise((resolve) => {
      const user = users.find(u => u.email === email);
      setTimeout(() => resolve(user), 100);
    });
  },

  async getUsersByRole(role) {
    try {
      console.log(`👥 Fetching users by role: ${role}`);
      const users = await apiService.get(API_ENDPOINTS.USERS.BY_ROLE(role));
      console.log('✅ Users by role fetched');
      return users;
    } catch (error) {
      console.error('❌ Error fetching users by role:', error);
      throw error;
    }
  },

  async getUsersByDepartment(department) {
    try {
      console.log(`👥 Fetching users by department: ${department}`);
      const users = await apiService.get(API_ENDPOINTS.USERS.BY_DEPARTMENT(department));
      console.log('✅ Users by department fetched');
      return users;
    } catch (error) {
      console.error('❌ Error fetching users by department:', error);
      throw error;
    }
  },

  async getActiveUsers() {
    return new Promise((resolve) => {
      const activeUsers = users.filter(u => u.isActive);
      setTimeout(() => resolve(activeUsers), 100);
    });
  },

  // CREATE Operations
  async createUser(userData) {
    try {
      console.log('👥 Creating new user via API...');
      const newUser = await apiService.post(API_ENDPOINTS.USERS.BASE, userData);
      console.log('✅ User created successfully');
      return newUser;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  async bulkCreateUsers(usersArray) {
    try {
      console.log(`👥 Creating ${usersArray.length} users via API...`);
      const result = await apiService.post(API_ENDPOINTS.USERS.BULK, {
        users: usersArray
      });
      console.log('✅ Bulk users created successfully');
      return result;
    } catch (error) {
      console.error('❌ Error creating bulk users:', error);
      throw error;
    }
  },

  // UPDATE Operations
  async updateUser(id, updateData) {
    try {
      console.log(`👥 Updating user ${id} via API...`);
      const updatedUser = await apiService.put(API_ENDPOINTS.USERS.BY_ID(id), updateData);
      console.log('✅ User updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  async updateUserLastLogin(id) {
    return new Promise((resolve, reject) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }

      users[index].lastLogin = new Date().toISOString();
      setTimeout(() => resolve(users[index]), 100);
    });
  },

  async bulkUpdateUsers(updates) {
    return new Promise((resolve, reject) => {
      try {
        const updatedUsers = [];
        
        updates.forEach(({ id, ...updateData }) => {
          const index = users.findIndex(u => u.id === id);
          if (index !== -1) {
            users[index] = { ...users[index], ...updateData };
            updatedUsers.push(users[index]);
          }
        });
        
        setTimeout(() => resolve(updatedUsers), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // DELETE Operations
  async deleteUser(id) {
    try {
      console.log(`👥 Deleting user ${id} via API...`);
      await apiService.delete(API_ENDPOINTS.USERS.BY_ID(id));
      console.log('✅ User deleted successfully');
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  },

  async deactivateUser(id) {
    return new Promise((resolve, reject) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }

      users[index].isActive = false;
      setTimeout(() => resolve(users[index]), 100);
    });
  },

  async activateUser(id) {
    return new Promise((resolve, reject) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }

      users[index].isActive = true;
      setTimeout(() => resolve(users[index]), 100);
    });
  },

  async bulkDeleteUsers(ids) {
    return new Promise((resolve) => {
      const deletedUsers = [];
      
      ids.forEach(id => {
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          deletedUsers.push(users.splice(index, 1)[0]);
        }
      });
      
      setTimeout(() => resolve(deletedUsers), 100);
    });
  },

  // SEARCH Operations
  async searchUsers(criteria) {
    return new Promise((resolve) => {
      const searchTerm = criteria.toLowerCase();
      const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      );
      setTimeout(() => resolve(filteredUsers), 100);
    });
  },

  async filterUsers(filters) {
    return new Promise((resolve) => {
      let filteredUsers = [...users];
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(u => u.role === filters.role);
      }
      
      if (filters.department) {
        filteredUsers = filteredUsers.filter(u => u.department === filters.department);
      }
      
      if (filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.isActive === filters.isActive);
      }
      
      if (filters.hasPermission) {
        filteredUsers = filteredUsers.filter(u => 
          u.permissions.includes(filters.hasPermission)
        );
      }
      
      setTimeout(() => resolve(filteredUsers), 100);
    });
  },

  // STATISTICS Operations
  async getUserStats() {
    try {
      console.log('📊 Fetching user statistics from API...');
      const stats = await apiService.get(API_ENDPOINTS.USERS.STATS);
      console.log('✅ User stats fetched');
      return stats;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error;
    }
  },

  async getUserSummary() {
    return new Promise((resolve) => {
      const summary = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        managerUsers: users.filter(u => u.role === 'manager').length,
        staffUsers: users.filter(u => u.role === 'staff').length,
        departments: [...new Set(users.map(u => u.department))],
        roles: [...new Set(users.map(u => u.role))],
        recentlyActive: users.filter(u => {
          if (!u.lastLogin) return false;
          const loginDate = new Date(u.lastLogin);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return loginDate > weekAgo;
        }).length
      };
      
      setTimeout(() => resolve(summary), 100);
    });
  },

  // AUTHENTICATION Operations
  async authenticateUser(username, password) {
    try {
      console.log('🔐 Authenticating user via API...');
      const result = await apiService.post(API_ENDPOINTS.USERS.VALIDATE, {
        username,
        password
      });
      
      if (result.data) {
        console.log('✅ User authenticated successfully');
        return result.data;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  },

  async checkUserPermission(userId, permission) {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }
      
      const hasPermission = user.permissions.includes(permission) || 
                           user.permissions.includes('*') ||
                           (user.role === 'admin' && permission.startsWith('admin.'));
      
      setTimeout(() => resolve(hasPermission), 100);
    });
  },

  async getUserPermissions(userId) {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.id === userId);
      if (!user) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }
      
      setTimeout(() => resolve(user.permissions), 100);
    });
  }
};