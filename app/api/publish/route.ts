import { NextResponse } from 'next/server'

export async function POST() {
  try {
    if (!process.env.PUBLISH_URL) {
      throw new Error('PUBLISH_URL is not configured')
    }

    if (!process.env.PUBLISH_TOKEN) {
      throw new Error('PUBLISH_TOKEN is not configured')
    }

    console.log('Making publish request to:', process.env.PUBLISH_URL)

    const response = await fetch(process.env.PUBLISH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PUBLISH_TOKEN}`,
      },
    })

    const responseData = await response.text()

    if (!response.ok) {
      throw new Error(`Failed to publish: ${response.status} ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully published changes'
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish'
      },
      { status: 500 }
    )
  }
} 