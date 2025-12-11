# Ventures Panel - Quick Start Guide

## Accessing the Panel

1. **Production**: https://ventures.isharehow.app/crm
2. **Local Dev**: `npm run dev` then visit http://localhost:3000/crm
3. Click the **"Ventures"** tab (6th tab with folder icon)

## First Look

You'll see:
- **4 Metric Cards** at the top showing totals and stats
- **Toolbar** with search, filters, and view toggle
- **5 Sample Ventures** in grid or table view

## Key Actions

### View a Venture
- **Grid View**: Click anywhere on a card
- **Table View**: Click on a row
- Opens detailed dialog with 3 tabs

### Add a New Venture
1. Click **"Add Venture"** button (top right)
2. Fill in the form:
   - Name (required)
   - Description (required)
   - Budget (required)
   - Deadline (required)
   - Status, Client, Tags (optional)
3. Click **"Create Venture"**

### Filter Ventures
- Click status chips: **All**, **Planning**, **Active**, **On Hold**, **Completed**
- Use search box for name, client, or tag search
- Filters work in real-time

### Switch Views
- Click **Grid icon** (⊞) for card view
- Click **List icon** (≡) for table view

### Edit/Delete
1. Click the **three-dot menu** (⋮) on any card or table row
2. Choose **View Details**, **Edit**, or **Delete**
3. Confirm deletion when prompted

## Understanding the UI

### Status Colors
- 🔵 **Blue** = Active
- 🟢 **Green** = Completed
- 🟠 **Orange** = On Hold
- ⚪ **Gray** = Planning
- 🔴 **Red** = Cancelled

### Progress Bars
- **Top bar** = Project completion percentage
- **Bottom bar** = Budget usage percentage
- Colors change based on usage (green → orange → red)

### Team Avatars
- Shows first 3-4 team members
- "+N" badge if more members exist
- Hover for member names

## Sample Ventures Explained

1. **E-Commerce Platform** - RetailCo project, 65% done, $150K budget
2. **Mobile App** - TechStart project, 42% done, $200K budget
3. **AI Analytics** - DataCorp project, 15% done (planning), $300K budget
4. **Brand Identity** - Fresh Foods project, 100% done, $80K budget
5. **Cloud Migration** - Legacy Systems project, 30% done (on hold), $250K budget

## Tips & Tricks

### Keyboard Navigation
- **Tab** through elements
- **Enter** to select
- **Escape** to close dialogs

### Responsive Design
- Desktop: 3 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row (stacked)

### Pagination
- Bottom of grid/table
- Change rows per page (6, 12, 24 for grid; 5, 10, 25, 50 for table)
- Navigate between pages with arrows

## Common Workflows

### Project Manager Daily Check
1. Open Ventures tab
2. Filter by "Active"
3. Check progress bars
4. Review budget usage
5. Click ventures needing attention

### Adding a New Project
1. Client meeting → capture requirements
2. Click "Add Venture"
3. Enter details from meeting
4. Assign team (can add later)
5. Set realistic deadline
6. Create venture

### Status Updates
1. Click venture card
2. Review current status
3. Update progress in backend (coming soon)
4. Check off completed tasks
5. Update budget spent

### Monthly Review
1. Filter by "Completed"
2. Review total revenue (top right metric)
3. Check delivery timelines
4. Export data (feature coming)

## Troubleshooting

### No ventures showing?
- Check filter chips (click "All")
- Clear search box
- Refresh page

### Can't add venture?
- Fill all required fields (marked with *)
- Check budget is a number
- Ensure deadline is after start date

### Performance issues?
- Reduce items per page
- Use filters to narrow results
- Clear browser cache

## What's Next?

This is currently using **mock data**. To connect to your real database:
1. Read `VENTURES_API_INTEGRATION.md`
2. Set up backend endpoints
3. Update `ventureService.ts`
4. Test with real data
5. Deploy!

## Need Help?

- 📖 **Full docs**: See `VENTURES_IMPLEMENTATION.md`
- 🎨 **Design reference**: See `VENTURES_FEATURES.md`
- 🔧 **API setup**: See `VENTURES_API_INTEGRATION.md`

---
**Pro Tip**: Try switching between Grid and Table views to see which works better for your workflow!
