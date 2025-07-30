# Forms Analysis Report - Kaha Hostel Management System

## Overview
This document provides a comprehensive analysis of all forms found in the Kaha Hostel Management System project, along with their corresponding JSON data structures for database implementation.

## Forms Identified

### 1. Demo Request Form (Landing Page)
**Location:** `src/pages/Landing.tsx`
**Purpose:** Collect demo requests from potential hostel owners
**Fields:**
- name (string, required)
- hostelName (string, required)
- location (string, required)
- email (string, required)
- phone (string, required)
- numberOfRooms (string, optional)
- currentSystem (string, optional)
- additionalInfo (string, optional)

### 2. Hostel Profile Form
**Location:** `src/components/admin/HostelProfile.tsx`
**Purpose:** Manage hostel information and settings
**Fields:**
- hostelName (string, required)
- ownerName (string, required)
- email (string, required)
- phone (string, required)
- address (string, required)
- province (string, required)
- district (string, required)
- description (string, optional)

### 3. Student Management Form
**Location:** `src/components/ledger/StudentManagement.tsx`
**Purpose:** Add and manage student information
**Fields:**
- name (string, required)
- phone (string, required)
- email (string, required)
- address (string, required)
- roomNumber (string, required)
- course (string, optional)
- institution (string, optional)
- guardianName (string, optional)
- guardianPhone (string, optional)
- emergencyContact (string, optional)
- baseMonthlyFee (number, required)
- laundryFee (number, optional)
- foodFee (number, optional)

### 4. Room Configuration Form
**Location:** `src/components/admin/RoomConfiguration.tsx`
**Purpose:** Add and configure rooms
**Fields:**
- name (string, required)
- type (string, required) - Options: "Dormitory", "Private", "Capsule"
- bedCount (number, required)
- gender (string, required) - Options: "Mixed", "Male", "Female"
- baseRate (number, required)
- amenities (array, optional)

### 5. Room Designer Dimensions Form
**Location:** `src/components/admin/RoomDesigner.tsx`
**Purpose:** Set room dimensions for room design
**Fields:**
- length (number, required)
- width (number, required)
- height (number, required)

### 6. Student Charge Configuration Form
**Location:** `src/components/ledger/StudentChargeConfiguration.tsx`
**Purpose:** Add custom charges for students
**Fields:**
- name (string, required)
- amount (number, required)
- type (string, required) - Options: "monthly", "one-time"
- category (string, required) - Options: "accommodation", "food", "laundry", "other"
- description (string, optional)

### 7. Payment Recording Form
**Location:** `src/components/ledger/PaymentRecording.tsx`
**Purpose:** Record student payments
**Fields:**
- selectedStudent (string, required)
- paymentAmount (string, required)
- paymentMode (string, required)
- referenceId (string, optional)

### 8. Invoice Management Form
**Location:** `src/components/ledger/InvoiceManagement.tsx`
**Purpose:** Edit invoice details
**Fields:**
- baseFee (number, required)
- extraServices (number, optional)
- previousDue (number, optional)
- discount (number, optional)
- status (string, required)
- dueDate (string, required)

### 9. Student Checkout Form
**Location:** `src/components/admin/StudentCheckout.tsx`
**Purpose:** Process student checkout
**Fields:**
- checkoutReason (string, required)
- customReason (string, optional)
- notes (string, optional)
- duesCleared (boolean, required)

### 10. Settings Form
**Location:** `src/pages/Settings.tsx`
**Purpose:** Manage system settings
**Fields:** Dynamic based on settings configuration (key-value pairs)

## Next Steps
The following JSON files should be created in the `src/data/` directory to support these forms with proper mock data.