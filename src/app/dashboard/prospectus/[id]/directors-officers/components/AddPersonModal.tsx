'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Committee, DirectorRole, OfficerRole, IndependenceStatus } from '../types'

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'director' | 'officer' | 'shareholder';
  prospectusId: string;
}

const directorRoles: { value: DirectorRole; label: string }[] = [
  { value: 'independent-director', label: 'Independent Director' },
  { value: 'audit-chair', label: 'Audit Committee Chair' },
  { value: 'compensation-chair', label: 'Compensation Committee Chair' },
  { value: 'governance-chair', label: 'Governance Committee Chair' },
  { value: 'lead-director', label: 'Lead Director' },
  { value: 'director', label: 'Director' },
];

const officerRoles: { value: OfficerRole; label: string }[] = [
  { value: 'ceo', label: 'Chief Executive Officer' },
  { value: 'cfo', label: 'Chief Financial Officer' },
  { value: 'coo', label: 'Chief Operating Officer' },
  { value: 'president', label: 'President' },
  { value: 'general-counsel', label: 'General Counsel' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'executive-vp', label: 'Executive Vice President' },
  { value: 'vp-finance', label: 'VP Finance' },
  { value: 'vp-operations', label: 'VP Operations' },
  { value: 'other', label: 'Other' },
];

const committees: { value: Committee; label: string }[] = [
  { value: 'audit', label: 'Audit Committee' },
  { value: 'compensation', label: 'Compensation Committee' },
  { value: 'governance', label: 'Governance Committee' },
  { value: 'nomination', label: 'Nomination Committee' },
];

const independenceOptions: { value: IndependenceStatus; label: string }[] = [
  { value: 'independent', label: 'Independent' },
  { value: 'management', label: 'Management' },
  { value: 'linked', label: 'Linked' },
];

export function AddPersonModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  prospectusId,
}: AddPersonModalProps) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: mode === 'director' ? directorRoles[0].value : officerRoles[0].value,
    committees: [] as Committee[],
    independence: 'independent' as IndependenceStatus,
    department: '',
    residencyCountry: 'Canada',
    residencyProvince: 'ON',
    bio: '',
    ownershipPercentage: '',
    shareCount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        photoFile,
        prospectusId,
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: mode === 'director' ? directorRoles[0].value : officerRoles[0].value,
        committees: [],
        independence: 'independent',
        department: '',
        residencyCountry: 'Canada',
        residencyProvince: 'ON',
        bio: '',
        ownershipPercentage: '',
        shareCount: '',
      });
      setPhotoFile(null);
      onClose();
    } catch (error) {
      console.error('Error adding person:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitteeChange = (committee: Committee) => {
    setFormData((prev) => ({
      ...prev,
      committees: prev.committees.includes(committee)
        ? prev.committees.filter((c) => c !== committee)
        : [...prev.committees, committee],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200 bg-white shadow-xl">
              <CardHeader className="sticky top-0 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Add {mode === 'director' ? 'Director' : mode === 'officer' ? 'Officer' : 'Shareholder'}
                    </CardTitle>
                    <CardDescription>
                      {mode === 'director'
                        ? 'Board member governance information'
                        : mode === 'officer'
                          ? 'Executive team member details'
                          : '10%+ shareholder information'}
                    </CardDescription>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4 pb-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Smith"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <select
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          required
                        >
                          {(mode === 'director' ? directorRoles : officerRoles).map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Director-Specific Fields */}
                  {mode === 'director' && (
                    <div className="space-y-4 pb-6 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Governance</h3>

                      <div>
                        <Label htmlFor="independence">Independence Status *</Label>
                        <select
                          id="independence"
                          value={formData.independence}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              independence: e.target.value as IndependenceStatus,
                            })
                          }
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                          required
                        >
                          {independenceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Committee Assignments</Label>
                        <div className="mt-2 space-y-2">
                          {committees.map((committee) => (
                            <label key={committee.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.committees.includes(committee.value)}
                                onChange={() => handleCommitteeChange(committee.value)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700">{committee.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Biography</Label>
                        <textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Background, expertise, and experience..."
                          rows={3}
                          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Officer-Specific Fields */}
                  {mode === 'officer' && (
                    <div className="space-y-4 pb-6 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Employment Details</h3>

                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({ ...formData, department: e.target.value })
                          }
                          placeholder="Finance, Operations, etc."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Shareholder-Specific Fields */}
                  {mode === 'shareholder' && (
                    <div className="space-y-4 pb-6 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Shareholding</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ownershipPercentage">Ownership % *</Label>
                          <Input
                            id="ownershipPercentage"
                            type="number"
                            step="0.01"
                            value={formData.ownershipPercentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ownershipPercentage: e.target.value,
                              })
                            }
                            placeholder="15.5"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shareCount">Share Count *</Label>
                          <Input
                            id="shareCount"
                            type="number"
                            value={formData.shareCount}
                            onChange={(e) =>
                              setFormData({ ...formData, shareCount: e.target.value })
                            }
                            placeholder="1,500,000"
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Residency */}
                  <div className="space-y-4 pb-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Residency</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="residencyCountry">Country *</Label>
                        <Input
                          id="residencyCountry"
                          value={formData.residencyCountry}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              residencyCountry: e.target.value,
                            })
                          }
                          placeholder="Canada"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="residencyProvince">Province/State</Label>
                        <Input
                          id="residencyProvince"
                          value={formData.residencyProvince}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              residencyProvince: e.target.value,
                            })
                          }
                          placeholder="Ontario"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload (Directors Only) */}
                  {mode === 'director' && (
                    <div className="space-y-4 pb-6 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Photo</h3>

                      <div className="flex items-center gap-4">
                        {photoFile && (
                          <div className="text-sm text-slate-600">
                            File: {photoFile.name}
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <Upload className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPhotoFile(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      style={{ background: '#E8312A' }}
                    >
                      {loading ? 'Adding...' : 'Add Person'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
