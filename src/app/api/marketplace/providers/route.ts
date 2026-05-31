import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RecentListing {
  date: string
  exchange: string
  sector: string
  raise: string
  headline: string
}

interface ProviderRow {
  id: string
  name: string
  category: string
  description: string | null
  specialties: string[]
  exchanges: string[]
  experience: string | null
  price_range: string | null
  rating: string | null
  review_count: number
  completed_listings: number
  badge: string | null
  recent_listings: RecentListing[]
  featured: boolean
  verified: boolean
  sort_order: number
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        id,
        name,
        category,
        description,
        specialties,
        exchanges,
        experience,
        price_range,
        rating,
        review_count,
        completed_listings,
        badge,
        recent_listings,
        featured,
        verified,
        sort_order
      FROM marketplace_providers
      ORDER BY featured DESC, sort_order ASC
    ` as ProviderRow[]

    const providers = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      description: r.description,
      specialties: r.specialties ?? [],
      exchanges: r.exchanges ?? [],
      experience: r.experience ?? '',
      priceRange: r.price_range ?? '',
      rating: r.rating ? parseFloat(r.rating) : 0,
      reviewCount: r.review_count,
      completedListings: r.completed_listings,
      badge: r.badge ?? undefined,
      recentListings: r.recent_listings ?? [],
      featured: r.featured,
      verified: r.verified,
      isVisible: false,
    }))

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Marketplace providers fetch error:', error)
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 })
  }
}
