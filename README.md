# Inventra PNJ

**Inventra PNJ** - Classroom Inventory Web Application for Politeknik Negeri Jakarta

## Project Description

Inventra PNJ is a classroom inventory web application designed to help Politeknik Negeri Jakarta manage inventory items in a centralized, organized, and easy-to-monitor system. The application focuses on practical classroom and learning-space operations, covering presentation tools, furniture, and consumable items used in daily academic activities.

The system allows admins to perform **CRUD (Create, Read, Update, Delete)** operations on inventory data while giving students access to check item availability, submit borrowing requests, and report damaged or missing items. With this approach, classroom inventory is not only recorded but also actively managed through workflows that fit campus operations.

## Project Vision

This project aims to build a modern, practical, and easy-to-use classroom inventory system for the PNJ academic community with the following goals:

- **Improve Inventory Management**: Consolidate classroom item records into one consistent system.
- **Increase Transparency**: Make item status clearly visible to admins and students.
- **Speed Up Borrowing Process**: Provide a structured borrowing request and approval workflow.
- **Simplify Issue Reporting**: Provide a fast path to report damaged or missing items.
- **Support Incremental Development**: Make this system a foundation for dashboards, reporting, and inventory automation in future phases.

We envision Inventra PNJ as a platform that makes classroom asset management more structured, efficient, and ready to evolve with campus needs.

## Key Features

### 1. **CRUD Data Inventaris**

- Add new inventory item records.
- View item lists and detailed inventory information.
- Update item information, location, quantity, and condition.
- Delete invalid or unused inventory records.

### 2. **Klasifikasi Inventaris Campuran**

- Supports classroom and laboratory equipment.
- Supports furniture and room assets.
- Supports consumable items.
- Allows grouping by category, location, and status.

### 3. **Pengajuan Peminjaman Barang**

- Students can request available items for borrowing.
- Admins can review borrowing requests.
- The system supports request statuses such as pending, approved, or rejected.
- Borrowing history can be used to track item usage.

### 4. **Pelaporan Kerusakan**

- Students can submit reports when items are damaged, missing, or unfit for use.
- Admins can follow up reports based on item condition.
- Item status can be updated to damaged, under repair, or unavailable.
- Helps maintain classroom inventory quality over time.

### 5. **Dashboard Status Inventaris**

- Displays summaries of available, borrowed, damaged, and out-of-stock items.
- Helps admins monitor inventory status quickly.
- Supports decision-making for procurement and maintenance.
- Serves as a foundation for more advanced inventory reporting.

## Application Scope

- Target Users: Students and Admins.
- Inventory Scope: Classroom equipment, furniture, and consumables.
- MVP Focus: Inventory CRUD, borrowing with admin approval, and damage reporting.

## Contract Details

- Contract Address: CDYRTWQDZG5Q5KNL67TDDPWMAWYG7IZMW2HNDP3T4OVOB5LEDEIIKDDG
  ![alt text](screenshot.png)

## Future Scope

### Short-Term Enhancements

1. **Advanced Search and Filters**: Improve item lookup by name, category, location, and status.
2. **Classroom Location Management**: Add room/class management as inventory units.
3. **Item Activity History**: Track data changes, borrowing activity, and damage reports.
4. **Request Status Notifications**: Notify students about borrowing approval outcomes.

### Medium-Term Development

1. **QR Codes for Item Identification**: Simplify item checks with unique codes.
   - Per-item inventory labels.
   - Faster checking process for admins.
   - Item validation during borrowing and return.
2. **Periodic Inventory Reports**: Summaries based on condition, location, and usage.
3. **Return Management Workflow**: Structured return process for borrowed items.
4. **Multi-Role Access**: Additional roles such as lecturers or homeroom teachers for monitoring.

### Long-Term Vision

1. **Procurement Integration**: Connect inventory data to procurement planning.
2. **Inventory Usage Analytics**: Identify most-used and most-damaged items.
3. **Mobile-Friendly Access**: Optimize UI for mobile devices.
4. **Campus SSO Integration**: Synchronize user accounts with campus authentication systems.
5. **Comprehensive Audit Trail**: Full change history for monitoring and evaluation.
6. **Cross-Room/Class Monitoring**: Track inventory across multiple rooms centrally.

### Institutional Features

1. **Department Inventory Standardization**: Align categories and data formats across classrooms.
2. **Asset Condition Reporting**: Condition summaries for campus administrative needs.
3. **Decision-Making Dashboard**: Data support for maintenance, replacement, and distribution.
4. **Multi-Language Support**: Broaden accessibility for wider adoption.

---

## Technical Requirements

- Backend service for inventory data management.
- Database for item, borrowing, and damage report records.
- Frontend web application for students and admins.
- Role-based authentication and authorization system.

## Getting Started

Initial development focuses on the following core modules:

- `create_item()` - Add a new inventory item.
- `get_items()` - View inventory item lists and details.
- `update_item()` - Update item data, stock, location, or condition.
- `delete_item()` - Delete inventory item data.
- `create_borrow_request()` - Submit item borrowing requests by students.
- `create_damage_report()` - Create reports for damaged or missing items.

---

**Inventra PNJ** - Building a More Organized and Modern Classroom Inventory Management System
