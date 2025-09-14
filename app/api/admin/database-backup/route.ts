import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    console.log('=== Database Backup API Called ===')

    // Get backup type from request
    const { backupType = 'simple' } = await request.json().catch(() => ({}))
    
    const projectRoot = process.cwd()
    const backupDir = path.join(projectRoot, 'database-backup')
    
    // Check if backup directory exists
    try {
      await fs.access(backupDir)
    } catch (error) {
      return NextResponse.json(
        { error: 'Backup system not found. Please run setup_backup.sh first.' },
        { status: 500 }
      )
    }

    console.log('Starting database backup process...')
    console.log('Backup type:', backupType)
    console.log('Backup directory:', backupDir)

    // Execute backup script
    const scriptName = backupType === 'advanced' ? 'download_database.py' : 'simple_backup.py'
    const scriptPath = path.join(backupDir, scriptName)
    const pythonPath = path.join(backupDir, 'backup_env', 'bin', 'python')

    return new Promise<NextResponse>((resolve) => {
      const process = spawn(pythonPath, [scriptPath], {
        cwd: backupDir,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let errorOutput = ''

      process.stdout.on('data', (data) => {
        const chunk = data.toString()
        output += chunk
        console.log('Backup stdout:', chunk.trim())
      })

      process.stderr.on('data', (data) => {
        const chunk = data.toString()
        errorOutput += chunk
        console.error('Backup stderr:', chunk.trim())
      })

      process.on('close', async (code) => {
        console.log('Backup process finished with code:', code)

        if (code === 0) {
          try {
            // Find the most recent backup file
            const files = await fs.readdir(backupDir)
            const backupFiles = files.filter(file => 
              file.endsWith('.xlsx') && 
              (file.startsWith('cufy_backup_') || file.startsWith('supabase_backup_'))
            )
            
            if (backupFiles.length > 0) {
              // Sort by creation time (most recent first)
              const fileStats = await Promise.all(
                backupFiles.map(async (file) => {
                  const stat = await fs.stat(path.join(backupDir, file))
                  return { file, mtime: stat.mtime }
                })
              )
              
              const latestFile = fileStats
                .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0]

              const filePath = path.join(backupDir, latestFile.file)
              const fileBuffer = await fs.readFile(filePath)
              const stats = await fs.stat(filePath)

              resolve(new NextResponse(fileBuffer as any, {
                status: 200,
                headers: {
                  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'Content-Disposition': `attachment; filename="${latestFile.file}"`,
                  'Content-Length': stats.size.toString(),
                  'X-Backup-Success': 'true',
                  'X-Backup-File': latestFile.file,
                  'X-Backup-Size': stats.size.toString()
                }
              }))
            } else {
              resolve(NextResponse.json(
                { 
                  error: 'Backup completed but no file was found',
                  output,
                  errorOutput 
                },
                { status: 500 }
              ))
            }
          } catch (fileError) {
            console.error('Error reading backup file:', fileError)
            resolve(NextResponse.json(
              { 
                error: 'Backup completed but failed to read file',
                details: fileError instanceof Error ? fileError.message : 'Unknown error',
                output,
                errorOutput 
              },
              { status: 500 }
            ))
          }
        } else {
          resolve(NextResponse.json(
            { 
              error: 'Backup process failed',
              exitCode: code,
              output,
              errorOutput 
            },
            { status: 500 }
          ))
        }
      })

      process.on('error', (error) => {
        console.error('Backup process error:', error)
        resolve(NextResponse.json(
          { 
            error: 'Failed to start backup process',
            details: error.message 
          },
          { status: 500 }
        ))
      })

      // Timeout after 5 minutes
      setTimeout(() => {
        process.kill()
        resolve(NextResponse.json(
          { error: 'Backup process timed out' },
          { status: 408 }
        ))
      }, 5 * 60 * 1000)
    })

  } catch (error) {
    console.error('Database backup API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
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

    // Get backup system status
    const projectRoot = process.cwd()
    const backupDir = path.join(projectRoot, 'database-backup')
    
    try {
      await fs.access(backupDir)
      
      // Check if virtual environment exists
      const venvPath = path.join(backupDir, 'backup_env')
      const pythonPath = path.join(venvPath, 'bin', 'python')
      
      try {
        await fs.access(pythonPath)
        
        // List recent backup files
        const files = await fs.readdir(backupDir)
        const backupFiles = files.filter(file => 
          file.endsWith('.xlsx') && 
          (file.startsWith('cufy_backup_') || file.startsWith('supabase_backup_'))
        )

        const recentBackups = await Promise.all(
          backupFiles.slice(-5).map(async (file) => {
            const stat = await fs.stat(path.join(backupDir, file))
            return {
              filename: file,
              size: stat.size,
              created: stat.mtime.toISOString(),
              sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`
            }
          })
        )

        return NextResponse.json({
          status: 'ready',
          message: 'Database backup system is ready',
          backupDirectory: backupDir,
          recentBackups: recentBackups.sort((a, b) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
          )
        })
        
      } catch (venvError) {
        return NextResponse.json({
          status: 'setup_required',
          message: 'Virtual environment not found. Run setup_backup.sh first.',
          backupDirectory: backupDir
        })
      }
      
    } catch (dirError) {
      return NextResponse.json({
        status: 'not_found',
        message: 'Backup system not found. Please set up the backup system first.',
        error: 'Directory not found'
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
