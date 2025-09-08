const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xdhtrwaghahigmbojotu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'
);

async function exploreTables() {
  try {
    console.log('🔍 Exploring database structure...\n');
    
    // Check if assignments table exists
    try {
      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .limit(3);
      
      if (!assignError) {
        console.log('📋 ASSIGNMENTS TABLE:');
        console.log('Sample assignments:', assignments);
        if (assignments && assignments.length > 0) {
          console.log('Columns:', Object.keys(assignments[0]));
        }
        
        const { count: assignCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true });
        console.log('Total assignments:', assignCount);
      } else {
        console.log('❌ Assignments table error:', assignError.message);
      }
    } catch (e) {
      console.log('❌ Assignments table not found or error:', e.message);
    }
    
    // Check if profile_assignments exists
    try {
      const { data: profileAssigns, error: profileError } = await supabase
        .from('profile_assignments')
        .select('*')
        .limit(3);
      
      if (!profileError) {
        console.log('\n📱 PROFILE_ASSIGNMENTS TABLE:');
        console.log('Sample profile assignments:', profileAssigns);
        if (profileAssigns && profileAssigns.length > 0) {
          console.log('Columns:', Object.keys(profileAssigns[0]));
        }
        
        const { count: profileCount } = await supabase
          .from('profile_assignments')
          .select('*', { count: 'exact', head: true });
        console.log('Total profile assignments:', profileCount);
      } else {
        console.log('❌ Profile assignments table error:', profileError.message);
      }
    } catch (e) {
      console.log('❌ Profile assignments table not found or error:', e.message);
    }
    
    // Check users table for assignment-related columns
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(2);
    
    if (!userError && users && users.length > 0) {
      console.log('\n👥 USERS TABLE STRUCTURE:');
      console.log('User columns:', Object.keys(users[0]));
      
      // Check subscription types
      const { data: subscriptions } = await supabase
        .from('users')
        .select('subscription_type')
        .not('subscription_type', 'is', null);
      
      if (subscriptions) {
        const subTypes = [...new Set(subscriptions.map(s => s.subscription_type))];
        console.log('Subscription types:', subTypes);
      }
    }
    
    // Check for temp/permanent zones
    try {
      const { data: zones, error: zoneError } = await supabase
        .from('zones')
        .select('*')
        .limit(5);
      
      if (!zoneError) {
        console.log('\n🏢 ZONES TABLE:');
        console.log('Sample zones:', zones);
        if (zones && zones.length > 0) {
          console.log('Zone columns:', Object.keys(zones[0]));
        }
      } else {
        console.log('❌ Zones table error:', zoneError.message);
      }
    } catch (e) {
      console.log('❌ Zones table not found or error:', e.message);
    }
    
    // Let's also check what tables exist
    console.log('\n🗂️ Checking available tables...');
    
    // Try common assignment-related table names
    const tableNames = [
      'user_assignments', 
      'matches', 
      'temp_assignments', 
      'permanent_assignments',
      'assignment_queue',
      'user_matches',
      'dating_assignments'
    ];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
          if (data && data.length > 0) {
            console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }
    
  } catch (error) {
    console.error('❌ Database exploration failed:', error);
  }
}

exploreTables();
