export interface PublishConfig {
  url: string;
  token: string;
}

export function getPublishConfig(): PublishConfig {
  const url = process.env.PUBLISH_URL
  const token = process.env.PUBLISH_TOKEN

  if (!url) {
    throw new Error('PUBLISH_URL environment variable is not set')
  }

  if (!token) {
    throw new Error('PUBLISH_TOKEN environment variable is not set')
  }

  return { url, token }
}

export async function publish() {
  const config = getPublishConfig()

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to publish: ${response.status}`)
  }

  return response.json()
} 