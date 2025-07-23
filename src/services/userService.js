// User Service - Staff and admin user management
import usersData from '../data/users.json';

let users = [...usersData];

export const userService = {
  // READ Operations
  async getAllUsers() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...users]), 100);
    });
  },

  async getUserById(id) {
    return new Promise((resolve) => {
      const user = users.find(u => u.id === id);
      setTimeout(() => resolve(user), 100);
    });
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
    return new Promise((resolve) => {
      const roleUsers = users.filter(u => u.role === role);
      setTimeout(() => resolve(roleUsers), 100);
    });
  },

  async getUsersByDepartment(department) {
    return new Promise((resolve) => {
      const deptUsers = users.filter(u => u.department === department);
      setTimeout(() => resolve(deptUsers), 100);
    });
  },

  async getActiveUsers() {
    return new Promise((resolve) => {
      const activeUsers = users.filter(u => u.isActive);
      setTimeout(() => resolve(activeUsers), 100);
    });
  },

  // CREATE Operations
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      // Check if username or email already exists
      const existingUser = users.find(u => 
        u.username === userData.username || u.email === userData.email
      );
      
      if (existingUser) {
        setTimeout(() => reject(new Error('Username or email already exists')), 100);
        return;
      }

      const newUser = {
        id: `USR${String(users.length + 1).padStart(3, '0')}`,
        ...userData,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        profileImage: userData.profileImage || '/images/profiles/default.jpg'
      };
      
      users.push(newUser);
      setTimeout(() => resolve(newUser), 100);
    });
  },

  async bulkCreateUsers(usersArray) {
    return new Promise((resolve, reject) => {
      try {
        const newUsers = [];
        
        for (let i = 0; i < usersArray.length; i++) {
          const userData = usersArray[i];
          
          // Check for duplicates
          const existingUser = users.find(u => 
            u.username === userData.username || u.email === userData.email
          );
          
          if (existingUser) {
            setTimeout(() => reject(new Error(`Duplicate user: ${userData.username}`)), 100);
            return;
          }
          
          const newUser = {
            id: `USR${String(users.length + newUsers.length + 1).padStart(3, '0')}`,
            ...userData,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profileImage: userData.profileImage || '/images/profiles/default.jpg'
          };
          
          newUsers.push(newUser);
        }
        
        users.push(...newUsers);
        setTimeout(() => resolve(newUsers), 100);
      } catch (error) {
        setTimeout(() => reject(error), 100);
      }
    });
  },

  // UPDATE Operations
  async updateUser(id, updateData) {
    return new Promise((resolve, reject) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }

      // Check for username/email conflicts if being updated
      if (updateData.username || updateData.email) {
        const conflictUser = users.find(u => 
          u.id !== id && (
            (updateData.username && u.username === updateData.username) ||
            (updateData.email && u.email === updateData.email)
          )
        );
        
        if (conflictUser) {
          setTimeout(() => reject(new Error('Username or email already exists')), 100);
          return;
        }
      }

      users[index] = { ...users[index], ...updateData };
      setTimeout(() => resolve(users[index]), 100);
    });
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
    return new Promise((resolve, reject) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        setTimeout(() => reject(new Error('User not found')), 100);
        return;
      }

      const deletedUser = users.splice(index, 1)[0];
      setTimeout(() => resolve(deletedUser), 100);
    });
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
    return new Promise((resolve) => {
      const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        byRole: {},
        byDepartment: {},
        recentLogins: users.filter(u => {
          if (!u.lastLogin) return false;
          const loginDate = new Date(u.lastLogin);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return loginDate > dayAgo;
        }).length
      };
      
      // Count by role
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      });
      
      // Count by department
      users.forEach(user => {
        stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
      });
      
      setTimeout(() => resolve(stats), 100);
    });
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
    return new Promise((resolve, reject) => {
      const user = users.find(u => 
        (u.username === username || u.email === username) && u.isActive
      );
      
      if (!user) {
        setTimeout(() => reject(new Error('User not found or inactive')), 100);
        return;
      }
      
      // In a real app, you would verify the password hash
      // For demo purposes, we'll assume authentication is successful
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Return user without sensitive data
      const { password: _, ...userWithoutPassword } = user;
      setTimeout(() => resolve(userWithoutPassword), 100);
    });
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