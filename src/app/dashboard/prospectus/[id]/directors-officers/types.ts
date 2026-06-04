/**
 * Type definitions for Directors & Officers Management
 * Covers directors, officers, and 10%+ shareholders
 */

/**
 * Role types for directors and officers
 */
export type DirectorRole =
  | 'independent-director'
  | 'audit-chair'
  | 'compensation-chair'
  | 'governance-chair'
  | 'lead-director'
  | 'director';

export type OfficerRole =
  | 'ceo'
  | 'cfo'
  | 'coo'
  | 'president'
  | 'general-counsel'
  | 'secretary'
  | 'treasurer'
  | 'executive-vp'
  | 'vp-finance'
  | 'vp-operations'
  | 'other';

/**
 * Committee memberships
 */
export type Committee = 'audit' | 'compensation' | 'governance' | 'nomination';

/**
 * Independence status
 */
export type IndependenceStatus = 'independent' | 'management' | 'linked';

/**
 * PIF (Personal Information Form) submission status
 */
export type PIFStatus = 'required' | 'draft' | 'in-progress' | 'submitted' | 'approved';

/**
 * SEDI (System for Electronic Disclosure by Insiders) registration status
 */
export type SEDIStatus = 'not-registered' | 'registered' | 'pending' | 'failed';

/**
 * Residency information
 */
export interface Residency {
  country: string;
  province?: string;
  city?: string;
  canadianResident?: boolean;
}

/**
 * Director information
 */
export interface Director {
  id: string;
  prospectusId: string;
  name: string;
  role: DirectorRole;
  email: string;
  phone?: string;
  independence: IndependenceStatus;
  committees: Committee[];
  residency: Residency;
  bio?: string;
  photoUrl?: string;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  documents: DirectorDocument[];
  yearsExperience?: number;
  expertise?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Officer information
 */
export interface Officer {
  id: string;
  prospectusId: string;
  name: string;
  title: OfficerRole;
  email: string;
  phone?: string;
  department?: string;
  sediStatus: SEDIStatus;
  sediRegistrationDate?: Date;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  holdings: ShareHolding;
  documents: OfficerDocument[];
  reportableInsider: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 10%+ shareholder information
 */
export interface SignificantShareholder {
  id: string;
  prospectusId: string;
  name: string;
  ownershipPercentage: number;
  shareCount: number;
  email?: string;
  pifRequired: boolean;
  pifStatus: PIFStatus;
  pifSubmittedDate?: Date;
  documents: ShareholderDocument[];
  shareholderAgreementUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Share holdings breakdown
 */
export interface ShareHolding {
  commonShares: number;
  options: number;
  warrants: number;
  restrictedShares?: number;
  rsus?: number;
  totalValue?: number;
}

/**
 * Document associated with director
 */
export interface DirectorDocument {
  id: string;
  name: string;
  type: 'pif' | 'board-resolution' | 'independence-declaration' | 'bio' | 'photo' | 'other';
  url: string;
  uploadedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Document associated with officer
 */
export interface OfficerDocument {
  id: string;
  name: string;
  type: 'pif' | 'sedi-registration' | 'insider-profile' | 'compensation' | 'other';
  url: string;
  uploadedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Document associated with shareholder
 */
export interface ShareholderDocument {
  id: string;
  name: string;
  type: 'pif' | 'shareholder-agreement' | 'cap-table-entry' | 'other';
  url: string;
  uploadedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Exchange-specific governance requirements
 */
export interface GovernanceRequirement {
  id: string;
  exchange: string;
  requirement: string;
  description: string;
  isMet: boolean;
  targetMetDate?: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Board composition summary
 */
export interface BoardComposition {
  totalDirectors: number;
  independentDirectors: number;
  managementDirectors: number;
  auditCommitteeMembers: number;
  compensationCommitteeMembers: number;
  governanceCommitteeMembers: number;
  financialExpertCount: number;
  canadianResidentsCount: number;
}

/**
 * Regulatory checklist item
 */
export interface RegulatoryChecklistItem {
  id: string;
  exchange: string;
  category: 'board-composition' | 'committees' | 'independence' | 'expertise' | 'documentation';
  requirement: string;
  isMet: boolean;
  daysRemaining?: number;
  notes?: string;
}

/**
 * Add Director/Officer form data
 */
export interface AddPersonFormData {
  name: string;
  email: string;
  phone?: string;
  role: DirectorRole | OfficerRole;
  committees?: Committee[];
  independence?: IndependenceStatus;
  department?: string;
  residencyCountry: string;
  residencyProvince?: string;
  bio?: string;
  photoFile?: File;
}

/**
 * PIF invitation payload
 */
export interface PIFInvitation {
  directorId?: string;
  officerId?: string;
  shareholderId?: string;
  email: string;
  exchangeName: string;
  formType: 'TSXV-Form-2A' | 'SEC-Schedule-A' | 'generic';
  invitationUrl: string;
}
