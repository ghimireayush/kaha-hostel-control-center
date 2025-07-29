# Frontend Static Data Analysis

## Overview
This document provides a comprehensive analysis of where the frontend codebase uses static JSON data instead of real API calls. The analysis covers all services, components, and data sources.

## Summary of Findings

### ✅ **Services Using Real APIs** (Already Integrated)
1. **studentService.js** - Uses backend API (`http://localhost:3001/api/v1/students`)
2. **invoiceService.js** - Uses backend API (`http://localhost:3001/api/v1/invoices`)
3. **paymentService.js** - Uses backend API (`http://localhost:3001/api/v1/payments`)
4. **ledgerService.js** - Uses backend API (`http://localhost:3001/api/v1/ledgers`)
5. **discountService.js** - Uses backend API (`http://localhost:3001/api/v1/discounts`)
6. **bookingService.js** - Uses backend API (`http://localhost:3001/api/v1/booking-requests`)
7. **roomService.js** - Uses backend API (`http://localhost:3001/api/v1/rooms`)
8. **analyticsService.js** - Uses backend API (`http://localhost:3001/api/v1/analytics`)
9. **reportService.js** - Uses backend API (`http://localhost:3001/api/v1/reports`)
10. **dashboardService.js** - Uses backend API (`http://localhost:3001/api/v1/analytics`)

### ❌ **Services Using Static Data** (Need API Integration)

#### 1. **hostelService.js** 
**Static Data Source:** `src/data/hostelProfile.json`
```javascript
import hostelProfileData from '../data/hostelProfile.json' with { type: 'json' };
```

**Data Structure:**
```json
{
  "hostelName": "Himalayan Backpackers Hostel",
  "ownerName": "Ramesh Shrestha",
  "email": "ramesh@himalayanhostel.com",
  "phone": "+977-9841234567",
  "address": "Thamel Marg, Ward No. 26",
  "province": "Bagmati",
  "district": "Kathmandu",
  "description": "A cozy hostel in the heart of Thamel...",
  "amenities": [...],
  "policies": {...},
  "socialMedia": {...}
}
```

**Methods:**
- `getHostelProfile()` - Get hostel profile information
- `updateHostelProfile(updates)` - Update hostel profile
- `getAmenities()` - Get hostel amenities
- `updateAmenities(amenities)` - Update amenities
- `getPolicies()` - Get hostel policies
- `updatePolicies(policies)` - Update policies

**Usage:** Currently not used in any components (potential future use)

---

#### 2. **maintenanceService.js**
**Static Data Source:** `src/data/maintenance.json`
```javascript
import maintenanceData from '../data/maintenance.json' with { type: 'json' };
```

**Data Structure:**
```json
[
  {
    "id": "MNT001",
    "roomId": "room-1",
    "title": "Water Leakage in Bathroom",
    "description": "Water is leaking from the bathroom ceiling...",
    "type": "repair",
    "priority": "high",
    "status": "completed",
    "reportedBy": "STU001",
    "reportedDate": "2024-01-15",
    "assignedTo": "TECH001",
    "completedDate": "2024-01-16",
    "cost": 2500,
    "notes": "Fixed the pipe connection"
  }
]
```

**Methods:**
- `getAllMaintenanceRequests()` - Get all maintenance requests
- `getMaintenanceRequestById(id)` - Get specific request
- `getMaintenanceRequestsByRoom(roomId)` - Get room-specific requests
- `getMaintenanceRequestsByStatus(status)` - Filter by status
- `createMaintenanceRequest(requestData)` - Create new request
- `updateMaintenanceRequest(id, updates)` - Update request
- `deleteMaintenanceRequest(id)` - Delete request
- `assignMaintenanceRequest(id, technicianId)` - Assign to technician
- `completeMaintenanceRequest(id, completionData)` - Mark as completed

**Usage:** Currently not used in any components

---

#### 3. **notificationService.js**
**Static Data Source:** `src/data/notifications.json`
```javascript
import notificationsData from '../data/notifications.json' with { type: 'json' };
```

**Data Structure:**
```json
[
  {
    "id": "NOT001",
    "recipientId": "STU001",
    "recipientType": "student",
    "title": "Monthly Invoice Generated",
    "message": "Your monthly invoice for January 2024 has been generated...",
    "type": "info",
    "category": "billing",
    "isRead": true,
    "createdAt": "2024-01-01T10:00:00Z",
    "readAt": "2024-01-01T10:30:00Z"
  }
]
```

**Methods:**
- `sendKahaAppNotification(studentId, message, type, priority)` - Send notification
- `getAllNotifications()` - Get all notifications
- `getNotificationsByRecipient(recipientId)` - Get user notifications
- `markNotificationAsRead(id)` - Mark as read
- `getUnreadNotifications(recipientId)` - Get unread notifications
- `getNotificationStats()` - Get notification statistics
- `deleteNotification(id)` - Delete notification

**Usage:** Used in `src/components/dashboard/SystemDashboard.tsx`
```typescript
import { notificationService } from '@/services/notificationService';
// ...
const notifications = await notificationService.getNotificationStats();
```

---

#### 4. **settingsService.js**
**Static Data Source:** `src/data/settings.json`
```javascript
import settingsData from '../data/settings.json' with { type: 'json' };
```

**Data Structure:**
```json
[
  {
    "id": "SET001",
    "category": "system",
    "key": "hostel_name",
    "value": "Kaha Hostel",
    "displayName": "Hostel Name",
    "description": "Official name of the hostel",
    "type": "text",
    "options": null,
    "isEditable": true,
    "isVisible": true,
    "lastModified": "2024-01-01T00:00:00Z",
    "modifiedBy": "USR001"
  }
]
```

**Methods:**
- `getAllSettings()` - Get all settings
- `getSettingById(id)` - Get specific setting
- `getSettingByKey(key)` - Get setting by key
- `getSettingsByCategory(category)` - Get category settings
- `updateSetting(id, updates)` - Update setting
- `bulkUpdateSettings(updates)` - Update multiple settings
- `resetSetting(id)` - Reset to default
- `createSetting(settingData)` - Create new setting

**Usage:** Used in `src/pages/Settings.tsx`
```typescript
import { settingsService } from '../services/settingsService';
// ...
const data = await settingsService.getAllSettings();
await settingsService.bulkUpdateSettings(updates);
```

---

#### 5. **userService.js**
**Static Data Source:** `src/data/users.json`
```javascript
import usersData from '../data/users.json' with { type: 'json' };
```

**Data Structure:**
```json
[
  {
    "id": "USR001",
    "username": "admin",
    "email": "admin@kahahostel.com",
    "fullName": "System Administrator",
    "role": "admin",
    "permissions": [
      "users.create",
      "users.read",
      "users.update",
      "users.delete"
    ],
    "isActive": true,
    "lastLogin": "2024-01-15T08:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Methods:**
- `getAllUsers()` - Get all users
- `getUserById(id)` - Get specific user
- `getUserByUsername(username)` - Get user by username
- `getUserByEmail(email)` - Get user by email
- `createUser(userData)` - Create new user
- `updateUser(id, updates)` - Update user
- `deleteUser(id)` - Delete user
- `authenticateUser(username, password)` - Authenticate user
- `updateUserPermissions(id, permissions)` - Update permissions

**Usage:** Currently not used in any components

---

## Static Data Files Analysis

### Files in `src/data/` Directory:
1. **analytics.json** - ❌ Not used (analytics uses API)
2. **bookingRequests.json** - ❌ Not used (booking uses API)
3. **discounts.json** - ❌ Not used (discounts use API)
4. **expenses.json** - ❌ Not used (no expense service found)
5. **hostelProfile.json** - ✅ Used by hostelService
6. **invoices.json** - ❌ Not used (invoices use API)
7. **ledger.json** - ❌ Not used (ledger uses API)
8. **maintenance.json** - ✅ Used by maintenanceService
9. **notifications.json** - ✅ Used by notificationService
10. **payments.json** - ❌ Not used (payments use API)
11. **reports.json** - ❌ Not used (reports use API)
12. **rooms.json** - ❌ Not used (rooms use API)
13. **settings.json** - ✅ Used by settingsService
14. **students.json** - ❌ Not used (students use API)
15. **users.json** - ✅ Used by userService

## Component Usage Analysis

### Components Using Static Data Services:

#### 1. **SystemDashboard.tsx**
```typescript
import { notificationService } from '@/services/notificationService';
// Uses: notificationService.getNotificationStats()
```

#### 2. **Settings.tsx** (Page)
```typescript
import { settingsService } from '../services/settingsService';
// Uses: settingsService.getAllSettings()
// Uses: settingsService.bulkUpdateSettings()
```

### Components NOT Using Static Data:
- All ledger components (Dashboard, PaymentManagement, DiscountManagement, etc.)
- All admin components (BookingManagement, StudentCheckout, etc.)
- AppContext (uses API services)

## Priority for API Integration

### **High Priority** (Currently Used in Components)
1. **notificationService** - Used in SystemDashboard
2. **settingsService** - Used in Settings page

### **Medium Priority** (Potential Future Use)
3. **hostelService** - Hostel profile management
4. **userService** - User/admin management
5. **maintenanceService** - Maintenance request management

## Required Backend APIs to Create

### 1. **Notifications API** (`/api/v1/notifications`)
**Endpoints Needed:**
- `GET /notifications` - Get all notifications
- `GET /notifications/stats` - Get notification statistics
- `GET /notifications/recipient/:id` - Get user notifications
- `POST /notifications` - Send new notification
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

### 2. **Settings API** (`/api/v1/settings`)
**Endpoints Needed:**
- `GET /settings` - Get all settings
- `GET /settings/:id` - Get specific setting
- `GET /settings/key/:key` - Get setting by key
- `GET /settings/category/:category` - Get category settings
- `PUT /settings/:id` - Update setting
- `PUT /settings/bulk` - Bulk update settings
- `POST /settings` - Create new setting
- `DELETE /settings/:id` - Delete setting

### 3. **Hostel Profile API** (`/api/v1/hostel`)
**Endpoints Needed:**
- `GET /hostel/profile` - Get hostel profile
- `PUT /hostel/profile` - Update hostel profile
- `GET /hostel/amenities` - Get amenities
- `PUT /hostel/amenities` - Update amenities
- `GET /hostel/policies` - Get policies
- `PUT /hostel/policies` - Update policies

### 4. **Users API** (`/api/v1/users`)
**Endpoints Needed:**
- `GET /users` - Get all users
- `GET /users/:id` - Get specific user
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/auth` - Authenticate user
- `PUT /users/:id/permissions` - Update permissions

### 5. **Maintenance API** (`/api/v1/maintenance`)
**Endpoints Needed:**
- `GET /maintenance` - Get all maintenance requests
- `GET /maintenance/:id` - Get specific request
- `GET /maintenance/room/:roomId` - Get room requests
- `POST /maintenance` - Create new request
- `PUT /maintenance/:id` - Update request
- `DELETE /maintenance/:id` - Delete request
- `POST /maintenance/:id/assign` - Assign to technician
- `POST /maintenance/:id/complete` - Mark as completed

## Migration Strategy

### Phase 1: High Priority (Immediate)
1. Create Notifications API and update notificationService
2. Create Settings API and update settingsService

### Phase 2: Medium Priority (Next Sprint)
3. Create Hostel Profile API and update hostelService
4. Create Users API and update userService

### Phase 3: Low Priority (Future)
5. Create Maintenance API and update maintenanceService

## Implementation Notes

### Current Architecture
- ✅ **API Services**: Use `fetch()` with proper error handling
- ✅ **Response Format**: Consistent `{ status, data }` format
- ✅ **Error Handling**: Proper try-catch with user-friendly messages
- ✅ **Loading States**: Components handle loading properly

### Required Changes for Static Services
1. **Replace static imports** with API calls
2. **Update method signatures** to be async/await
3. **Add proper error handling** like other services
4. **Maintain same interface** to avoid component changes
5. **Add API base URL** configuration

### Example Migration Pattern
```javascript
// Before (Static Data)
import settingsData from '../data/settings.json' with { type: 'json' };
let settings = [...settingsData];

export const settingsService = {
  async getAllSettings() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...settings]), 100);
    });
  }
};

// After (API Integration)
const API_BASE_URL = "http://localhost:3001/api/v1";

export const settingsService = {
  async getAllSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }
};
```

## Conclusion

**Summary:**
- **10 services** already use real APIs ✅
- **5 services** still use static data ❌
- **2 services** are actively used in components (high priority)
- **3 services** are not currently used (medium/low priority)

**Next Steps:**
1. Create backend APIs for notifications and settings (high priority)
2. Update frontend services to use real APIs
3. Test integration with existing components
4. Create remaining APIs for hostel, users, and maintenance (lower priority)

The majority of the frontend is already using real APIs, with only 5 services remaining that use static data. The most critical ones to migrate are notificationService and settingsService since they're actively used in components.