// Test profile selection functionality
console.log('🧪 Testing Profile Selection Fix...');

// This script will help us debug the profile selection issue
function testProfileSelection() {
  console.log('📋 Current Debug Info:');
  
  // Check if we're on the dashboard
  if (window.location.pathname !== '/dashboard') {
    console.log('❌ Not on dashboard page');
    return;
  }
  
  // Check for profiles displayed
  const profileCards = document.querySelectorAll('[data-testid="match-card"], .match-card, .profile-card');
  console.log(`👥 Found ${profileCards.length} profile cards on page`);
  
  // Check for select buttons
  const selectButtons = document.querySelectorAll('button');
  const selectProfileButtons = Array.from(selectButtons).filter(btn => 
    btn.textContent?.includes('Select Profile') || btn.textContent?.includes('select')
  );
  console.log(`🔘 Found ${selectProfileButtons.length} select buttons`);
  
  // Check for assignment data in React state (if available)
  if (window.React) {
    console.log('⚛️ React detected - checking for state...');
  }
  
  // Check local storage for any cached data
  const dashboardData = localStorage.getItem('dashboard-data');
  if (dashboardData) {
    console.log('💾 Found dashboard data in localStorage');
  }
  
  // Test click handler
  if (selectProfileButtons.length > 0) {
    console.log('🎯 Ready to test selection - click a "Select Profile" button');
    
    // Add event listeners to log selections
    selectProfileButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        console.log(`🎯 Profile selection initiated for button ${index + 1}`);
        
        // Wait a bit and check the result
        setTimeout(() => {
          const newProfileCards = document.querySelectorAll('[data-testid="match-card"], .match-card, .profile-card');
          console.log(`📊 After selection: ${newProfileCards.length} profile cards visible`);
          
          const newSelectButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent?.includes('Select Profile')
          );
          console.log(`🔘 After selection: ${newSelectButtons.length} select buttons visible`);
          
          if (newProfileCards.length === 1 && newSelectButtons.length === 0) {
            console.log('✅ SUCCESS: Only one profile visible, no select buttons - hiding worked!');
          } else {
            console.log('❌ ISSUE: Multiple profiles still visible or select buttons still present');
          }
        }, 2000);
      });
    });
  }
}

// Run the test
testProfileSelection();

// Also set up a periodic check
setInterval(() => {
  if (window.location.pathname === '/dashboard') {
    const profileCards = document.querySelectorAll('[data-testid="match-card"], .match-card, .profile-card');
    const selectButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Select Profile')
    );
    
    if (profileCards.length > 1 && selectButtons.length > 1) {
      console.log('📊 Multiple profiles still visible - selection may not be working');
    }
  }
}, 5000);
