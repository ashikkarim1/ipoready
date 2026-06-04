# LinkedIn Verification API - Integration Guide

Quick reference for developers integrating the LinkedIn Verification API into components and services.

## Quick Start

### 1. Verify a LinkedIn Profile

```typescript
// Endpoint: POST /api/directors-officers/[directorId]/verify-linkedin
const verifyLinkedIn = async (directorId: string, linkedinUrl: string) => {
  const response = await fetch(
    `/api/directors-officers/${directorId}/verify-linkedin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedinUrl })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  return response.json();
};

// Usage
const { extractedData, confidence, verificationId } = 
  await verifyLinkedIn('director-123', 'https://www.linkedin.com/in/jane-smith/');

console.log('Extracted Education:', extractedData.education);
console.log('Extracted Experience:', extractedData.experience);
console.log('Confidence:', confidence); // 0.85
```

### 2. Check Verification Status

```typescript
// Endpoint: GET /api/directors-officers/[directorId]/linkedin-verification-status
const getVerificationStatus = async (directorId: string) => {
  const response = await fetch(
    `/api/directors-officers/${directorId}/linkedin-verification-status`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch verification status');
  }
  
  return response.json();
};

// Usage
const status = await getVerificationStatus('director-123');

if (status.verified) {
  console.log('LinkedIn verified at:', status.extractedAt);
  console.log('Current role:', status.data.currentRole);
  console.log('Board experience:', status.data.experience);
} else {
  console.log('Not verified yet');
}
```

### 3. Auto-Populate Director Profile

```typescript
// Endpoint: POST /api/directors-officers/[directorId]/auto-populate-from-linkedin
const autoPopulate = async (directorId: string) => {
  const response = await fetch(
    `/api/directors-officers/${directorId}/auto-populate-from-linkedin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  return response.json();
};

// Usage
const { director, fieldsUpdated, populationConfidence } = 
  await autoPopulate('director-123');

console.log('Updated fields:', fieldsUpdated);
// ["principalOccupation", "yearsExperience", "education", "certifications", "boardExperience"]
console.log('Director bio:', director.bio);
console.log('Years experience:', director.yearsExperience);
```

---

## React Component Examples

### Example 1: LinkedIn Verification Form

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function LinkedInVerificationForm({ directorId }: { directorId: string }) {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [extractedData, setExtractedData] = useState(null)

  const handleVerify = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/directors-officers/${directorId}/verify-linkedin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkedinUrl })
        }
      )

      if (!response.ok) {
        const { error: errorMsg, details } = await response.json()
        throw new Error(details || errorMsg)
      }

      const data = await response.json()
      setVerified(true)
      setExtractedData(data.extractedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (verified && extractedData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            LinkedIn profile verified successfully!
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold mb-2">Extracted Information</h3>
          <p><strong>Role:</strong> {extractedData.currentRole}</p>
          <p><strong>Company:</strong> {extractedData.currentCompany}</p>
          <p><strong>Education:</strong> {extractedData.education.length} school(s)</p>
          <p><strong>Experience:</strong> {extractedData.experience.length} position(s)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://www.linkedin.com/in/jane-smith/"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleVerify} disabled={loading || !linkedinUrl}>
          {loading ? 'Verifying...' : 'Verify LinkedIn'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

### Example 2: Auto-Populate with Confirmation

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AutoPopulateButton({ directorId }: { directorId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldsUpdated, setFieldsUpdated] = useState<string[]>([])

  const handleAutoPopulate = async () => {
    if (!confirm('This will update the director profile with LinkedIn data. Continue?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/directors-officers/${directorId}/auto-populate-from-linkedin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      )

      if (!response.ok) {
        const { error: errorMsg, details } = await response.json()
        throw new Error(details || errorMsg)
      }

      const data = await response.json()
      setSuccess(true)
      setFieldsUpdated(data.fieldsUpdated)

      // Refresh parent component
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auto-population failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription>
          <strong>Profile updated successfully!</strong>
          <p className="text-sm mt-2">Updated fields: {fieldsUpdated.join(', ')}</p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Button 
        onClick={handleAutoPopulate} 
        disabled={loading}
        variant="default"
      >
        {loading ? 'Updating...' : 'Auto-Populate from LinkedIn'}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
```

### Example 3: Verification Status Display

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function VerificationStatus({ directorId }: { directorId: string }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/directors-officers/${directorId}/linkedin-verification-status`
        )
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error('Error fetching status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [directorId])

  if (loading) return <div>Loading...</div>

  if (!status?.verified) {
    return (
      <Badge variant="outline" className="bg-yellow-50">
        Not Verified
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <Badge className="bg-green-100 text-green-800">
        LinkedIn Verified
      </Badge>

      <div className="text-sm space-y-1 ml-2">
        <p><strong>Verified:</strong> {new Date(status.extractedAt).toLocaleDateString()}</p>
        <p><strong>Confidence:</strong> {(status.confidence * 100).toFixed(0)}%</p>
        <p><strong>Profile:</strong> {status.data?.currentRole}</p>
        <p><strong>Company:</strong> {status.data?.currentCompany}</p>
      </div>
    </div>
  )
}
```

---

## Service/Hook Examples

### React Hook for LinkedIn Verification

```typescript
'use client'

import { useState } from 'react'

interface UseLinkedInVerificationReturn {
  verify: (directorId: string, linkedinUrl: string) => Promise<any>
  autoPopulate: (directorId: string) => Promise<any>
  getStatus: (directorId: string) => Promise<any>
  loading: boolean
  error: string | null
}

export function useLinkedInVerification(): UseLinkedInVerificationReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = async (directorId: string, linkedinUrl: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/directors-officers/${directorId}/verify-linkedin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkedinUrl })
        }
      )

      if (!response.ok) {
        const { error: err, details } = await response.json()
        throw new Error(details || err)
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const autoPopulate = async (directorId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/directors-officers/${directorId}/auto-populate-from-linkedin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      )

      if (!response.ok) {
        const { error: err, details } = await response.json()
        throw new Error(details || err)
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto-population failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getStatus = async (directorId: string) => {
    try {
      const response = await fetch(
        `/api/directors-officers/${directorId}/linkedin-verification-status`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status'
      setError(message)
      throw err
    }
  }

  return { verify, autoPopulate, getStatus, loading, error }
}
```

### Usage of Hook

```typescript
import { useLinkedInVerification } from '@/hooks/useLinkedInVerification'

export function DirectorProfile({ directorId }: { directorId: string }) {
  const { verify, autoPopulate, getStatus, loading, error } = 
    useLinkedInVerification()

  const handleVerify = async (linkedinUrl: string) => {
    try {
      const result = await verify(directorId, linkedinUrl)
      console.log('Verified:', result.extractedData)
    } catch (err) {
      console.error('Verification failed')
    }
  }

  const handleAutoPopulate = async () => {
    try {
      const result = await autoPopulate(directorId)
      console.log('Updated director:', result.director)
    } catch (err) {
      console.error('Auto-population failed')
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      
      <button 
        onClick={() => handleVerify('https://www.linkedin.com/in/jane/')}
        disabled={loading}
      >
        Verify LinkedIn
      </button>

      <button 
        onClick={handleAutoPopulate}
        disabled={loading}
      >
        Auto-Populate
      </button>
    </div>
  )
}
```

---

## API Response Types (TypeScript)

```typescript
// Verification Response
interface LinkedInVerificationResponse {
  verified: boolean;
  extractedData: {
    profileHeadline: string;
    currentCompany: string;
    currentRole: string;
    education: Education[];
    experience: Experience[];
    certifications: Certification[];
    skills: string[];
  };
  confidence: number;
  verificationId: string;
  verifiedAt: string;
}

// Status Response
interface VerificationStatusResponse {
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  extractedAt?: string;
  confidence?: number;
  data?: LinkedInExtractedData | null;
  verificationId?: string;
  linkedinUrl?: string;
  verificationMethod?: string;
}

// Auto-Populate Response
interface AutoPopulateResponse {
  success: boolean;
  director: {
    id: string;
    name: string;
    principalOccupation: string;
    yearsExperience: number;
    education: Education[];
    certifications: string[];
    boardExperience: BoardPosition[];
    bio: string;
    linkedinVerified: boolean;
    verificationStatus: string;
  };
  fieldsUpdated: string[];
  populationConfidence: number;
}

// Data structure types
interface Education {
  school: string;
  degree: string;
  field: string;
  year?: number;
}

interface Experience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
}

interface Certification {
  name: string;
  issuer?: string;
  issuedDate?: string;
}

interface BoardPosition {
  title: string;
  company: string;
  years: number;
}
```

---

## Error Handling Patterns

### Try-Catch Pattern

```typescript
try {
  const result = await fetch(`/api/directors-officers/${directorId}/verify-linkedin`, {
    method: 'POST',
    body: JSON.stringify({ linkedinUrl })
  }).then(r => r.json());
  
  // Handle success
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

### Response Status Checking

```typescript
const response = await fetch(...);

if (!response.ok) {
  const errorData = await response.json();
  
  switch (response.status) {
    case 400:
      console.error('Invalid request:', errorData.details);
      break;
    case 401:
      console.error('Unauthorized - please login');
      break;
    case 404:
      console.error('Director or verification not found');
      break;
    case 500:
      console.error('Server error:', errorData.details);
      break;
  }
}
```

---

## Testing URLs

```typescript
// Valid test URLs
const validUrls = [
  'https://www.linkedin.com/in/jane-smith/',
  'https://www.linkedin.com/in/john-doe-123/',
  'https://www.linkedin.com/company/techcorp/',
];

// Invalid test URLs
const invalidUrls = [
  'https://linkedin.com/in/jane/', // missing www
  'https://www.linkedin.com/jane/', // missing /in/
  'https://www.linkedin.com/', // no profile
  'https://www.facebook.com/jane/', // wrong domain
];
```

---

## Deployment Checklist

- [ ] Verify all three routes are created in `/src/app/api/directors-officers/[directorId]/`
- [ ] Test with valid LinkedIn URLs
- [ ] Test error handling for invalid URLs
- [ ] Verify database schema exists (director_linkedin_verification table)
- [ ] Test with authenticated user session
- [ ] Test auto-population updates correct fields
- [ ] Verify extracted data is stored in database
- [ ] Test mock data generation consistency
- [ ] Update frontend to use new endpoints
- [ ] Add TypeScript types to shared types file
- [ ] Document in developer wiki
- [ ] Add tests for all three endpoints

