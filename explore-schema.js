const { createClient } = require('@supabase/supabase-js');

// Using the service role key that we know works
const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function exploreSchema() {
  try {
    console.log('🔍 Exploring complete database schema...\n');

    // Get all tables in the database
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_tables');

    if (tablesError) {
      console.log('Using alternative method to explore tables...');
      
      // Try to query common tables we expect
      const expectedTables = [
        'users', 
        'profile_assignments', 
        'temporary_matches', 
        'permanent_matches',
        'payments',
        'boys_entry_control'
      ];

      for (const tableName of expectedTables) {
        try {
          console.log(`\n📋 Table: ${tableName}`);
          
          // Get table structure by selecting with limit 0
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (error) {
            console.log(`   ❌ ${error.message}`);
            continue;
          }

          // Get count
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          console.log(`   📊 Record count: ${count}`);

          if (data && data.length > 0) {
            console.log(`   🏗️  Columns: ${Object.keys(data[0]).join(', ')}`);
          } else {
            // Try to get structure differently
            const { data: sampleData } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (sampleData && sampleData.length > 0) {
              console.log(`   🏗️  Columns: ${Object.keys(sampleData[0]).join(', ')}`);
            }
          }

        } catch (tableError) {
          console.log(`   ❌ Error accessing ${tableName}: ${tableError.message}`);
        }
      }
    }

    // Specifically check assignment-related tables
    console.log('\n🎯 ASSIGNMENT SYSTEM ANALYSIS:');
    
    // Check profile_assignments
    try {
      const { data: assignments, count: assignmentCount } = await supabase
        .from('profile_assignments')
        .select('*', { count: 'exact' })
        .limit(5);

      console.log(`\n📋 profile_assignments: ${assignmentCount} records`);
      if (assignments && assignments.length > 0) {
        console.log('   Structure:', Object.keys(assignments[0]));
        console.log('   Sample:', assignments[0]);
      }
    } catch (error) {
      console.log('   ❌ profile_assignments not accessible:', error.message);
    }

    // Check temporary_matches
    try {
      const { data: tempMatches, count: tempCount } = await supabase
        .from('temporary_matches')
        .select('*', { count: 'exact' })
        .limit(5);

      console.log(`\n📋 temporary_matches: ${tempCount} records`);
      if (tempMatches && tempMatches.length > 0) {
        console.log('   Structure:', Object.keys(tempMatches[0]));
        console.log('   Sample:', tempMatches[0]);
      }
    } catch (error) {
      console.log('   ❌ temporary_matches not accessible:', error.message);
    }

    // Check permanent_matches
    try {
      const { data: permMatches, count: permCount } = await supabase
        .from('permanent_matches')
        .select('*', { count: 'exact' })
        .limit(5);

      console.log(`\n📋 permanent_matches: ${permCount} records`);
      if (permMatches && permMatches.length > 0) {
        console.log('   Structure:', Object.keys(permMatches[0]));
        console.log('   Sample:', permMatches[0]);
      }
    } catch (error) {
      console.log('   ❌ permanent_matches not accessible:', error.message);
    }

    // Check boys_entry_control
    try {
      const { data: boysControl, count: boysCount } = await supabase
        .from('boys_entry_control')
        .select('*', { count: 'exact' })
        .limit(5);

      console.log(`\n📋 boys_entry_control: ${boysCount} records`);
      if (boysControl && boysControl.length > 0) {
        console.log('   Structure:', Object.keys(boysControl[0]));
        console.log('   Sample:', boysControl[0]);
      }
    } catch (error) {
      console.log('   ❌ boys_entry_control not accessible:', error.message);
    }

    // Get user breakdown by gender and subscription
    console.log('\n👥 USER ANALYSIS:');
    try {
      const { data: users } = await supabase
        .from('users')
        .select('gender, subscription_type, payment_confirmed, is_admin');

      if (users) {
        const maleUsers = users.filter(u => u.gender === 'male');
        const femaleUsers = users.filter(u => u.gender === 'female');
        const paidUsers = users.filter(u => u.payment_confirmed === true);
        const adminUsers = users.filter(u => u.is_admin === true);

        console.log(`   👨 Male users: ${maleUsers.length}`);
        console.log(`   👩 Female users: ${femaleUsers.length}`);
        console.log(`   💳 Paid users: ${paidUsers.length}`);
        console.log(`   👑 Admin users: ${adminUsers.length}`);

        // Subscription breakdown
        const subscriptionCounts = {};
        users.forEach(user => {
          const sub = user.subscription_type || 'none';
          subscriptionCounts[sub] = (subscriptionCounts[sub] || 0) + 1;
        });
        console.log('   📊 Subscription breakdown:', subscriptionCounts);
      }
    } catch (error) {
      console.log('   ❌ Error analyzing users:', error.message);
    }

  } catch (error) {
    console.error('Schema exploration failed:', error);
  }
}

exploreSchema();
