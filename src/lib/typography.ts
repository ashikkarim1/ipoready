/**
 * Typography System - Single Source of Truth
 *
 * This file defines the semantic typography scale for the IPOReady dashboard.
 * All text sizing should use these definitions for consistency.
 *
 * Usage:
 *   - Use className directly: className="h1"
 *   - Or import for reference: import { typography } from '@/lib/typography'
 *   - Or reference in constants: typography.body.className
 *
 * Guidelines:
 *   - h1/h2/h3/h4: Headings and titles
 *   - body/body-sm: Paragraph text and content
 *   - label/label-sm/label-xs: Form labels, badges, pills, status indicators
 *   - caption/caption-sm: Secondary text, hints, metadata, timestamps
 */

export const typography = {
  // === HEADINGS ===
  h1: {
    className: 'h1',
    fontSize: '2.1rem',
    fontWeight: 700,
    lineHeight: 1.2,
    usage: 'Page titles, hero headlines',
  },
  h2: {
    className: 'h2',
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: 1.2,
    usage: 'Section headings, major divisions',
  },
  h3: {
    className: 'h3',
    fontSize: '1.5rem',
    fontWeight: 700,
    lineHeight: 1.3,
    usage: 'Subsection headings, card titles',
  },
  h4: {
    className: 'h4',
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
    usage: 'Subheadings, section headers within content',
  },

  // === BODY TEXT ===
  body: {
    className: 'body',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    usage: 'Main paragraph text, primary content',
  },
  bodySm: {
    className: 'body-sm',
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.4,
    usage: 'Smaller body text, supporting content',
  },

  // === LABELS ===
  label: {
    className: 'label',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.25,
    usage: 'Form labels, input labels',
  },
  labelSm: {
    className: 'label-sm',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
    usage: 'Badges, status indicators, pills',
  },
  labelXs: {
    className: 'label-xs',
    fontSize: '0.6875rem',
    fontWeight: 700,
    lineHeight: 1.1,
    usage: 'Mini badges, small indicators',
  },

  // === CAPTIONS ===
  caption: {
    className: 'caption',
    fontSize: '0.8125rem',
    fontWeight: 400,
    lineHeight: 1.4,
    usage: 'Secondary text, hints, helper text',
  },
  captionSm: {
    className: 'caption-sm',
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.3,
    usage: 'Meta information, timestamps, footnotes',
  },
} as const

/**
 * Type-safe access to class names
 * Usage: typography.body.className returns 'body'
 */
export type TypographyKey = keyof typeof typography

/**
 * Helper function to get className for a typography key
 * Usage: getTypographyClass('body') returns 'body'
 */
export function getTypographyClass(
  key: TypographyKey,
): string {
  return typography[key].className
}

/**
 * Complete list of all semantic typography classes
 * Useful for type checking and validation
 */
export const semanticClasses = [
  'h1',
  'h2',
  'h3',
  'h4',
  'body',
  'body-sm',
  'label',
  'label-sm',
  'label-xs',
  'caption',
  'caption-sm',
] as const

export type SemanticTypographyClass = typeof semanticClasses[number]
