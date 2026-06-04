import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/app/components/Header'
import { ArrowRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react'

// Example guide data - replace with CMS or props
const GUIDES: Record<string, any> = {
  'ipo-checklist-canada': {
    title: 'The Complete IPO Checklist for Canadian Companies',
    description: 'Master every step of the IPO process across TSX, TSXV, and CSE.',
    readTime: 18,
    published: '2024-06-01',
    updated: '2024-06-04',
    author: 'IPOReady Team',
    category: 'Guide',
    featured: true,
    sections: [
      {
        title: 'Getting Started',
        content: 'Before you begin your IPO journey, ensure your company has...'
      },
      {
        title: 'Pre-Filing Phase',
        content: 'The pre-filing phase is critical for IPO success...'
      },
      // Add more sections
    ],
    toc: [
      'Getting Started',
      'Pre-Filing Phase',
      'Filing Phase',
      'Marketing Phase',
      'Closing Phase',
    ],
    relatedGuides: [
      { title: 'IPO vs Direct Listing vs SPAC', slug: 'ipo-vs-direct-listing-vs-spac-vs-rto' },
      { title: 'IPO Cost Breakdown', slug: 'ipo-cost-breakdown' },
    ],
    cta: {
      title: 'Ready to Go Public?',
      description: 'Use IPOReady to track all 180 IPO milestones in one place.',
      buttonText: 'Start Your IPO Journey',
      buttonLink: '/register',
    }
  },
  // Add more guides...
}

export async function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({
    slug,
  }))
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = GUIDES[params.slug]

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Guide not found</h1>
          <Link href="/resources" className="text-accent hover:underline">
            Back to Resources →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F4' }}>
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" style={{ color: '#E8312A' }} />
            <span className="label-sm font-semibold" style={{ color: '#E8312A' }}>
              {guide.category}
            </span>
          </div>

          <h1 className="serif text-4xl md:text-5xl mb-4 leading-tight" style={{ color: '#1A1A1A' }}>
            {guide.title}
          </h1>

          <p className="text-lg mb-6" style={{ color: '#666666' }}>
            {guide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#9A9A9A' }}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{guide.readTime} min read</span>
            </div>
            <span>•</span>
            <span>Updated {guide.updated}</span>
            <span>•</span>
            <span>By {guide.author}</span>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <div className="prose prose-lg max-w-none" style={{ color: '#333333' }}>
              {guide.sections.map((section: any, idx: number) => (
                <div key={idx} className="mb-12">
                  <h2 className="serif text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                    {section.title}
                  </h2>
                  <p style={{ color: '#666666', lineHeight: 1.7 }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Related guides */}
            {guide.relatedGuides.length > 0 && (
              <div className="mt-16 pt-12 border-t border-gray-200">
                <h3 className="font-bold text-lg mb-6" style={{ color: '#1A1A1A' }}>
                  Related Guides
                </h3>
                <div className="space-y-3">
                  {guide.relatedGuides.map((related: any) => (
                    <Link
                      key={related.slug}
                      href={`/guides/${related.slug}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                    >
                      <span style={{ color: '#1A1A1A' }}>{related.title}</span>
                      <ArrowRight className="w-4 h-4" style={{ color: '#E8312A' }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar TOC */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="sticky top-20 bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Table of Contents
              </h3>
              <ul className="space-y-2">
                {guide.toc.map((item: string) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm hover:underline"
                      style={{ color: '#666666' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {guide.cta && (
        <section className="bg-white border-t border-gray-200 py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
              <h2 className="serif text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                {guide.cta.title}
              </h2>
              <p className="text-lg mb-6" style={{ color: '#666666' }}>
                {guide.cta.description}
              </p>
              <Link
                href={guide.cta.buttonLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition"
                style={{ background: '#E8312A' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#D62518')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#E8312A')}
              >
                {guide.cta.buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
