# Inventra PNJ — Design Spec

Date: 2026-04-20
Status: Approved in chat for README direction

## Summary

Inventra PNJ is a web-based classroom inventory management application for Politeknik Negeri Jakarta. The product is designed for two main user groups:

- **Mahasiswa**: browse inventory, submit borrowing requests, and report damaged or missing items
- **Admin**: manage inventory data, approve or reject requests, track stock, and follow up on issue reports

The initial repository task is limited to repositioning the project through `README.md`. The README should describe the intended product clearly, preserve the overall structure of the current README, and pivot the project away from the existing Stellar Notes DApp narrative.

## Product Goals

1. Establish a clear product identity for the repository
2. Make CRUD inventory management the foundation of the app
3. Highlight two differentiating MVP workflows:
   - borrowing with admin approval
   - damage reporting by students
4. Keep the project realistic and incrementally extensible

## Recommended Product Approach

### Chosen Approach: Inventory-first CRUD with operational workflows

The MVP should center on structured inventory records first, then layer on operational flows that matter to campus usage.

This approach was chosen because it:

- gives the project a stable data model
- supports mixed asset types from day one
- keeps the MVP practical and understandable
- allows future growth into dashboards, QR-based asset tracking, and reporting

## Users and Roles

### Admin

- create, update, and delete inventory data
- categorize assets by type and location
- update stock and condition
- approve or reject borrowing requests
- review damage reporting submissions and update follow-up status

### Mahasiswa

- view inventory availability
- submit borrowing requests
- see request history
- submit damage reporting for damaged, missing, or unusable items

## MVP Feature Set

### Core CRUD

- create inventory item data
- read inventory lists and item details
- update item information, quantity, location, and condition
- delete obsolete or invalid inventory records

### Inventory Attributes

- item name
- category
- room or class location
- quantity
- unit
- item condition
- availability status

### Operational Features

- borrowing request submission
- admin approval or rejection workflow
- borrowing history tracking
- damage reporting, including damaged, missing, or unusable items
- status overview for available, borrowed, damaged, and depleted items

## Data Model Direction

Suggested entities for future implementation:

- **Item**
- **Category**
- **Location**
- **BorrowRequest**
- **DamageReport**
- **User**

## Non-Goals for This README Pivot

The README should not promise advanced functionality that is not yet aligned with the current scope, such as:

- IoT integrations
- real-time hardware scanning
- cross-campus procurement automation
- predictive analytics

These can be mentioned only as future scope.

## README Content Direction

The updated README should:

- introduce the app as **Inventra PNJ**
- explain the classroom inventory problem it solves
- emphasize CRUD as the baseline capability
- present borrowing approval and damage reporting as standout features
- clarify that damage reporting can cover damaged, missing, or unusable items
- describe future development realistically
- remove blockchain-specific language, contract addresses, and Soroban-specific framing

## Acceptance Criteria for This Task

1. `README.md` is rewritten around the Inventra PNJ concept
2. The structure remains broadly aligned with the existing README sections
3. The content clearly targets classroom inventory management for PNJ
4. CRUD functionality is explicitly described
5. Borrowing approval and damage reporting are included as MVP highlights
6. The final explanation to the user summarizes what project will be built
