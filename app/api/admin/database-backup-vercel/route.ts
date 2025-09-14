import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'

// Supabase Configuration for direct access
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Check if user is admin
async function isAdmin() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return false
    }

    const adminEmail = process.env.ADMIN_EMAIL
    return session.user.email === adminEmail
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Create Excel-like CSV format
function createCSVContent(data: any[], tableName: string) {
  if (!data || data.length === 0) {
    return `Table: ${tableName}\nNo data found\n\n`
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    `Table: ${tableName}`,
    `Records: ${data.length}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle null/undefined values
        if (value === null || value === undefined) return ''
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      }).join(',')
    )
  ]
  
  return csvRows.join('\n') + '\n\n'
}

// All database tables to backup
const TABLES = [
  'users',
  'subscriptions', 
  'payments',
  'profile_assignments',
  'temporary_matches',
  'permanent_matches',
  'user_rounds',
  'user_actions',
  'admin_notes',
  'system_settings',
  'female_profile_stats'
]

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    console.log('=== Vercel Database Backup API Called ===')

    // Get backup type from request
    const { backupType = 'simple' } = await request.json().catch(() => ({}))
    
    // Create Supabase client with service role for full access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    console.log('Starting database backup process...')
    console.log('Backup type:', backupType)

    let csvContent = `CUFY Database Backup\n`
    csvContent += `Generated: ${new Date().toISOString()}\n`
    csvContent += `Backup Type: ${backupType}\n`
    csvContent += `Total Tables: ${TABLES.length}\n`
    csvContent += `==========================================\n\n`

    const backupSummary = {
      successful: [] as string[],
      failed: [] as string[],
      totalRecords: 0
    }

    // Backup each table
    for (const table of TABLES) {
      try {
        console.log(`📥 Downloading ${table}...`)
        
        const { data, error } = await supabase
          .from(table)
          .select('*')

        if (error) {
          console.error(`❌ ${table}: ${error.message}`)
          backupSummary.failed.push(table)
          csvContent += `Table: ${table}\nERROR: ${error.message}\n\n`
        } else {
          console.log(`✅ ${table}: ${data?.length || 0} records`)
          backupSummary.successful.push(table)
          backupSummary.totalRecords += data?.length || 0
          csvContent += createCSVContent(data || [], table)
        }
      } catch (tableError) {
        console.error(`❌ ${table}: Failed -`, tableError)
        backupSummary.failed.push(table)
        csvContent += `Table: ${table}\nERROR: ${tableError instanceof Error ? tableError.message : 'Unknown error'}\n\n`
      }
    }

    // Add summary at the end
    csvContent += `\n==========================================\n`
    csvContent += `BACKUP SUMMARY\n`
    csvContent += `==========================================\n`
    csvContent += `✅ Successful tables (${backupSummary.successful.length}):\n`
    backupSummary.successful.forEach(table => {
      csvContent += `   - ${table}\n`
    })
    
    if (backupSummary.failed.length > 0) {
      csvContent += `\n❌ Failed tables (${backupSummary.failed.length}):\n`
      backupSummary.failed.forEach(table => {
        csvContent += `   - ${table}\n`
      })
    }
    
    csvContent += `\n📊 Total Records: ${backupSummary.totalRecords}\n`
    csvContent += `💾 File Generated: ${new Date().toISOString()}\n`

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `cufy_backup_${timestamp}.csv`

    console.log(`✅ Backup completed: ${backupSummary.totalRecords} records`)

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Success': 'true',
        'X-Backup-Records': backupSummary.totalRecords.toString(),
        'X-Backup-Tables': backupSummary.successful.length.toString(),
        'X-Backup-Failed': backupSummary.failed.length.toString()
      }
    })

  } catch (error) {
    console.error('Database backup API error:', error)
    return NextResponse.json(
      { 
        error: 'Backup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'This error occurred on the server. The backup system may need setup or there may be a database connection issue.'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Test database connection
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      
      // Test with a simple query
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (error) {
        return NextResponse.json({
          status: 'error',
          message: 'Database connection failed',
          error: error.message
        })
      }

      return NextResponse.json({
        status: 'ready',
        message: 'Vercel-compatible backup system is ready',
        environment: 'serverless',
        backupFormat: 'CSV',
        tables: TABLES,
        totalTables: TABLES.length,
        lastCheck: new Date().toISOString()
      })
      
    } catch (dbError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection test failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Database backup status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check backup system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
