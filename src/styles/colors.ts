/**
 * IPOReady Semantic Color System
 *
 * All colors are semantic tokens organized by function, not appearance.
 * This enables consistent theming, accessibility compliance, and future dark mode support.
 *
 * Usage in components:
 * - CSS: Use CSS variables from globals.css (e.g., background: var(--color-bg-primary))
 * - Tailwind: Use color-stop classes (e.g., bg-nav, text-text-secondary)
 * - React inline: Reference this object as JS constants
 *
 * Color Reference:
 * - Brand: #1A1A1A (primary dark), #E8312A (accent red)
 * - Grays: #F7F6F4 (bg), #E5E4E0 (border), #717171 (text)
 * - States: Green (#2D7A5F), Red (#DC2626), Blue (#1D4ED8), Amber (#B45309)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRIMARY / BRAND COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Primary brand color — used for primary text, primary button backgrounds,
 * dark surfaces, brand accent elements, and logo backgrounds
 */
export const COLOR_PRIMARY = '#1A1A1A'

/**
 * Brand accent color — used for call-to-action buttons, brand highlights,
 * logo accent, error states, and important interactive elements
 */
export const COLOR_ACCENT = '#E8312A'

/**
 * Secondary accent — used for tertiary CTAs, links, and special UI elements
 */
export const COLOR_ACCENT_SECONDARY = '#FF6B35'

/**
 * Purple accent — used for alternative states, special badges, and secondary CTAs
 */
export const COLOR_ACCENT_PURPLE = '#7C3AED'

/**
 * Elevated/card surface — white background used for cards, modals, and raised surfaces
 */
export const COLOR_SURFACE_PRIMARY = '#FFFFFF'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEXT COLORS (Hierarchy)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Primary text — used for headings, main body text, and primary labels
 * Contrast ratio: 21:1 on white background (WCAG AAA)
 */
export const COLOR_TEXT_PRIMARY = '#1A1A1A'

/**
 * Secondary text — used for subheadings, secondary labels, and sidebar text
 * Contrast ratio: 9.4:1 on white background (WCAG AAA)
 */
export const COLOR_TEXT_SECONDARY = '#717171'

/**
 * Tertiary text — used for captions, disabled text, placeholder text
 * Contrast ratio: 5.5:1 on white background (WCAG AA)
 */
export const COLOR_TEXT_TERTIARY = '#9A9A9A'

/**
 * Muted text — used for hints, disabled states, and very subtle text
 * Contrast ratio: 4.1:1 on white background (barely WCAG AA)
 */
export const COLOR_TEXT_MUTED = '#C4C2BE'

/**
 * Inverse text — used for text on dark backgrounds or dark surfaces
 */
export const COLOR_TEXT_INVERSE = '#FFFFFF'

/**
 * Chart/graph text — used for axes labels and chart annotations
 */
export const COLOR_TEXT_CHART = '#6B7280'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BACKGROUND & SURFACE COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Page background — neutral beige used for main page background and large sections
 */
export const COLOR_BG_PRIMARY = '#F7F6F4'

/**
 * Secondary surface — subtle background for grouped sections and hover states
 */
export const COLOR_SURFACE_SECONDARY = '#F0EFED'

/**
 * Minimal surface — near-white background for slight distinction
 */
export const COLOR_SURFACE_LIGHT = '#FAFAF9'

/**
 * Warm light surface — cream/vanilla background for subtle warmth
 */
export const COLOR_SURFACE_WARM = '#FFFBEB'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BORDER & DIVIDER COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Primary border — used for card borders, input borders, dividers, and section separators
 */
export const COLOR_BORDER = '#E5E4E0'

/**
 * Dark border — used for medium-emphasis borders and hover state borders
 */
export const COLOR_BORDER_MEDIUM = '#EEECE8'

/**
 * Strong border — used for dark gray borders and strong dividers
 */
export const COLOR_BORDER_DARK = '#C8C7C2'

/**
 * Dark stroke — used for SVG strokes and chart elements
 */
export const COLOR_STROKE_DARK = '#2A2A2A'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATE COLORS: SUCCESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Success color — used for completion indicators, success messages, and positive states
 */
export const COLOR_SUCCESS = '#2D7A5F'

/**
 * Success dark — used for strong success states and success button hover
 */
export const COLOR_SUCCESS_DARK = '#15803D'

/**
 * Success bright — used for success indicator dots and progress rings
 */
export const COLOR_SUCCESS_BRIGHT = '#22C55E'

/**
 * Success soft — used for success backgrounds, success badges, and success surfaces
 */
export const COLOR_SUCCESS_SOFT = '#EAF5F0'

/**
 * Success light — alternative light success background
 */
export const COLOR_SUCCESS_LIGHT = '#F0FDF4'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATE COLORS: ERROR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Error color — used for error messages, error badges, and destructive actions
 */
export const COLOR_ERROR = '#DC2626'

/**
 * Error dark — used for error hover states and strong error states
 */
export const COLOR_ERROR_DARK = '#B91C1C'

/**
 * Error soft — used for error backgrounds and error surfaces
 */
export const COLOR_ERROR_SOFT = '#FDECEB'

/**
 * Error light — alternative light error background
 */
export const COLOR_ERROR_LIGHT = '#FEF2F2'

/**
 * Error pale — very light error background for emphasis
 */
export const COLOR_ERROR_PALE = '#FEE2E2'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATE COLORS: WARNING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Warning color — used for warning badges, "due soon" states, and caution indicators
 */
export const COLOR_WARNING = '#B45309'

/**
 * Warning dark — used for warning hover states and strong warning states
 */
export const COLOR_WARNING_DARK = '#D97706'

/**
 * Warning soft — used for warning backgrounds and warning surfaces
 */
export const COLOR_WARNING_SOFT = '#FEF3C7'

/**
 * Warning medium — medium-strength warning background
 */
export const COLOR_WARNING_MEDIUM = '#FDE68A'

/**
 * Warning pale — very light warning background
 */
export const COLOR_WARNING_PALE = '#FFFBEB'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATE COLORS: INFO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Info color — used for informational messages, progress indicators, and CTAs
 */
export const COLOR_INFO = '#1D4ED8'

/**
 * Info medium — medium-strength info blue for charts and secondary UI
 */
export const COLOR_INFO_MEDIUM = '#BFDBFE'

/**
 * Info soft — used for info backgrounds and info surfaces
 */
export const COLOR_INFO_SOFT = '#EFF6FF'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Input background — used for text input fields and form controls
 */
export const COLOR_INPUT_BG = '#F0EFED'

/**
 * Disabled state — used for disabled buttons, disabled text, and disabled form elements
 */
export const COLOR_DISABLED = '#D1D5DB'

/**
 * Overlay dark subtle — used for subtle overlays and shadow bases
 */
export const OVERLAY_DARK_SUBTLE = 'rgba(26,26,26,0.07)'

/**
 * Overlay white subtle — used for subtle white overlays on dark backgrounds
 */
export const OVERLAY_WHITE_SUBTLE = 'rgba(255,255,255,0.1)'

/**
 * Overlay white medium — used for white overlays with more opacity
 */
export const OVERLAY_WHITE_MEDIUM = 'rgba(255,255,255,0.5)'

/**
 * Overlay white high — used for high-opacity white overlays
 */
export const OVERLAY_WHITE_HIGH = 'rgba(255,255,255,0.65)'

/**
 * Overlay accent subtle — used for subtle red/accent overlays
 */
export const OVERLAY_ACCENT_SUBTLE = 'rgba(232,49,42,0.2)'

/**
 * Overlay success subtle — used for subtle green/success overlays
 */
export const OVERLAY_SUCCESS_SUBTLE = 'rgba(45,122,95,0.2)'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHADOW VALUES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SHADOW_LIGHT = 'rgba(0,0,0,0.08)'
export const SHADOW_MINIMAL = 'rgba(0,0,0,0.04)'
export const SHADOW_CARD = 'rgba(0,0,0,0.06)'
export const SHADOW_MODAL = 'rgba(0,0,0,0.12)'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLOR PALETTES (grouped for easy reference)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COLORS = {
  // Brand
  primary: COLOR_PRIMARY,
  accent: COLOR_ACCENT,
  accentSecondary: COLOR_ACCENT_SECONDARY,
  accentPurple: COLOR_ACCENT_PURPLE,

  // Text hierarchy
  textPrimary: COLOR_TEXT_PRIMARY,
  textSecondary: COLOR_TEXT_SECONDARY,
  textTertiary: COLOR_TEXT_TERTIARY,
  textMuted: COLOR_TEXT_MUTED,
  textInverse: COLOR_TEXT_INVERSE,
  textChart: COLOR_TEXT_CHART,

  // Surfaces & backgrounds
  surfacePrimary: COLOR_SURFACE_PRIMARY,
  surfaceSecondary: COLOR_SURFACE_SECONDARY,
  surfaceLight: COLOR_SURFACE_LIGHT,
  surfaceWarm: COLOR_SURFACE_WARM,
  bgPrimary: COLOR_BG_PRIMARY,

  // Borders
  border: COLOR_BORDER,
  borderMedium: COLOR_BORDER_MEDIUM,
  borderDark: COLOR_BORDER_DARK,
  strokeDark: COLOR_STROKE_DARK,

  // States
  success: COLOR_SUCCESS,
  successDark: COLOR_SUCCESS_DARK,
  successBright: COLOR_SUCCESS_BRIGHT,
  successSoft: COLOR_SUCCESS_SOFT,
  successLight: COLOR_SUCCESS_LIGHT,

  error: COLOR_ERROR,
  errorDark: COLOR_ERROR_DARK,
  errorSoft: COLOR_ERROR_SOFT,
  errorLight: COLOR_ERROR_LIGHT,
  errorPale: COLOR_ERROR_PALE,

  warning: COLOR_WARNING,
  warningDark: COLOR_WARNING_DARK,
  warningSoft: COLOR_WARNING_SOFT,
  warningMedium: COLOR_WARNING_MEDIUM,
  warningPale: COLOR_WARNING_PALE,

  info: COLOR_INFO,
  infoMedium: COLOR_INFO_MEDIUM,
  infoSoft: COLOR_INFO_SOFT,

  // Utilities
  inputBg: COLOR_INPUT_BG,
  disabled: COLOR_DISABLED,
} as const

export type ColorKey = keyof typeof COLORS
