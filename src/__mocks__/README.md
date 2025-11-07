# Mock Data Files

This directory contains backup copies of the original mock data files that were used before backend integration.

## Files

- `dashboard-mock-data.ts` - Original mock metrics, spoilage, and activity data for Dashboard
- `inventory-mock-data.ts` - Original mock inventory items and purchase history
- `spoilage-mock-data.ts` - Original mock spoilage alerts and risk summaries
- `sales-mock-data.ts` - Original mock sales sessions and inventory

## Purpose

These files are kept for reference and potential use in:
- Unit testing
- Storybook component documentation
- Development without backend
- Demo/preview environments

## Current Status

The main application pages now use real backend data through custom React hooks:
- Dashboard uses `useDashboardData()`
- Inventory uses `useInventoryData()`
- Spoilage uses `useSpoilageData()`
- Sales uses `useSalesData()`

These mock files are **no longer imported** in the production code paths.
