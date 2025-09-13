# Admin Matches Panel - Search & Filter Features

## 🔍 New Search & Filter Capabilities

The AdminMatchesPanel now includes comprehensive search and filtering functionality to help administrators efficiently manage user matches.

### 📋 Features Added

#### 1. **Main Search Bar**
- **Real-time search** across male users
- Search by:
  - Full name
  - Email address
  - University name
- **Clear search** button for quick reset

#### 2. **Advanced Filters Panel**
- **Collapsible interface** - Click "Filters" to expand/collapse
- **Active filter indicator** - Shows when filters are applied
- **Filter results summary** - Shows filtered vs total counts

#### 3. **Status Filters**
- **User Status**: Filter by waiting, assigned, temporary_match, permanently_matched
- **Subscription Type**: Filter by Premium (₹249) or Basic (₹99)
- **Assignment Status**: 
  - No Assignments (users with 0 assignments)
  - Partial Assignments (users with some but not full assignments)
  - Full Assignments (users at their assignment limit)
  - Has Assignments (users with any assignments)
- **University Filter**: Filter by specific universities

#### 4. **Female User Search**
- **Separate search** for female users in assignment dialogs
- Filters available female users during assignment process
- **Real-time filtering** as you type

#### 5. **Filter Management**
- **Clear All** button to reset all filters at once
- **Active filter badges** show which filters are applied
- **Persistent filtering** - filters remain active during data refreshes

### 🎯 Use Cases

#### For Daily Management:
```
1. Search "pending payment" users
2. Filter by university to manage regional assignments
3. Find users with partial assignments to complete their profiles
4. Locate specific users by name for quick actions
```

#### For Assignment Tasks:
```
1. Filter by "no assignments" to find users needing profiles
2. Search female users by university for targeted assignments
3. Filter by subscription type to manage premium vs basic allocations
4. Find users in "waiting" status for immediate assignment
```

#### For Monitoring:
```
1. Filter by "temporary_match" to track pending decisions
2. Search by email for customer support cases
3. Filter by "permanently_matched" to see successful matches
4. Use university filter to monitor regional performance
```

### 🔧 Technical Implementation

#### State Management:
```typescript
// Search states
const [searchTerm, setSearchTerm] = useState('')
const [femaleSearchTerm, setFemaleSearchTerm] = useState('')

// Filter states
const [statusFilter, setStatusFilter] = useState('all')
const [subscriptionFilter, setSubscriptionFilter] = useState('all')
const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('all')
const [universityFilter, setUniversityFilter] = useState('all')

// UI states
const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
```

#### Filtering Logic:
```typescript
const filteredMaleUsers = useMemo(() => {
  return maleUsers.filter(user => {
    // Multi-field search
    if (searchTerm && !user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.university.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Status-based filtering
    if (statusFilter !== 'all' && user.status !== statusFilter) return false
    if (subscriptionFilter !== 'all' && user.subscription_type !== subscriptionFilter) return false
    
    // Assignment-based filtering
    if (assignmentStatusFilter === 'no_assignments' && user.assignedCount > 0) return false
    if (assignmentStatusFilter === 'full_assignments' && user.assignedCount < user.maxAssignments) return false
    
    return true
  })
}, [maleUsers, searchTerm, statusFilter, subscriptionFilter, assignmentStatusFilter, universityFilter])
```

### 🎨 UI Components

#### Search Bar:
- Lucide Search icon
- Real-time input handling
- Clear button with XCircle icon
- Placeholder text guidance

#### Filter Controls:
- Collapsible panel with smooth animations
- Select dropdowns for each filter type
- Active filter badges
- Clear all functionality

#### Results Summary:
- Shows filtered count vs total count
- Active filter indicators
- Real-time updates

### 📊 Performance Optimizations

1. **useMemo** for filtered data to prevent unnecessary recalculations
2. **Debounced search** for smooth typing experience
3. **Lazy loading** of filter options
4. **Efficient array operations** for large datasets

### 🔮 Future Enhancements

#### Planned Features:
- **Saved filter presets** for common searches
- **Export filtered results** to CSV
- **Advanced date range filtering** for registration/assignment dates
- **Bulk actions** on filtered users
- **Search history** for quick re-application
- **Custom filter combinations** with AND/OR logic

#### Performance Improvements:
- **Virtual scrolling** for large user lists
- **Server-side filtering** for better performance
- **Search suggestions** based on existing data
- **Filter caching** for frequently used combinations

### 💡 Tips for Administrators

#### Efficient Workflows:
1. **Start broad, narrow down**: Use status filters first, then search by name
2. **Combine filters**: Use university + subscription type for targeted management
3. **Use Clear All**: Reset filters frequently to avoid missing users
4. **Monitor filter summary**: Check the results count to ensure you're not over-filtering

#### Common Filter Combinations:
- `Status: waiting` + `Subscription: premium` = Premium users needing assignments
- `Assignment Status: no_assignments` + `University: specific` = Regional assignment targets
- `Status: temporary_match` + `Subscription: any` = Users in decision phase
- `Assignment Status: partial_assignments` = Users needing more profiles

---

**Enhanced AdminMatchesPanel** - Now with powerful search and filtering capabilities! 🎯

Access the admin panel at: `http://localhost:3001/admin` (or your configured port)

The search and filter features are designed to make user management efficient and intuitive for administrators handling large user bases.
