'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, X, Users, Award, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Director, Officer, BoardComposition } from '../types'

interface BoardCompositionOverviewProps {
  directors: Director[];
  officers: Officer[];
  onAddDirector: () => void;
  selectedExchange?: string;
}

export function BoardCompositionOverview({
  directors,
  officers,
  onAddDirector,
  selectedExchange,
}: BoardCompositionOverviewProps) {
  const composition = calculateBoardComposition(directors)

  // Exchange requirements
  const requirements = getExchangeRequirements(selectedExchange || 'tsxv')

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Directors */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Total Directors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {composition.totalDirectors}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {composition.independentDirectors} independent
            </p>
          </CardContent>
        </Card>

        {/* Independent Directors */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Independent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {composition.independentDirectors}/{composition.totalDirectors}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Requirement: 2+ (min)
            </p>
          </CardContent>
        </Card>

        {/* Audit Committee */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Audit Committee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {composition.auditCommitteeMembers}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {composition.financialExpertCount} financial expert
            </p>
          </CardContent>
        </Card>

        {/* Compensation Committee */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Comp Committee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {composition.compensationCommitteeMembers}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Requirement: 1+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Status */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exchange Requirements</CardTitle>
              <CardDescription>
                {selectedExchange?.toUpperCase() || 'TSXV'} compliance checklist
              </CardDescription>
            </div>
            <Button
              onClick={onAddDirector}
              className="bg-red-600 hover:bg-red-700 text-white"
              style={{ background: '#E8312A', borderColor: '#E8312A' }}
            >
              + Add Director/Officer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requirements.map((req, idx) => {
              const met = checkRequirementMet(req, composition, directors);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                >
                  <div className="mt-0.5">
                    {met ? (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{req}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function calculateBoardComposition(directors: Director[]): BoardComposition {
  return {
    totalDirectors: directors.length,
    independentDirectors: directors.filter((d) => d.independence === 'independent').length,
    managementDirectors: directors.filter((d) => d.independence === 'management').length,
    auditCommitteeMembers: directors.filter((d) => d.committees.includes('audit')).length,
    compensationCommitteeMembers: directors.filter((d) =>
      d.committees.includes('compensation')
    ).length,
    governanceCommitteeMembers: directors.filter((d) =>
      d.committees.includes('governance')
    ).length,
    financialExpertCount: 1, // Placeholder
    canadianResidentsCount: directors.filter(
      (d) => d.residency.canadianResident !== false
    ).length,
  };
}

function getExchangeRequirements(exchange: string): string[] {
  const requirements: Record<string, string[]> = {
    tsxv: [
      'Minimum 2 independent directors',
      'Minimum 3 directors total',
      'Audit committee required (independent majority)',
      'Audit committee financial expert',
      'Compensation committee recommended',
      'Board diversity policy',
      'Conflicts of interest policy',
      'All directors, officers, and 10%+ shareholders PIFs submitted',
    ],
    tsx: [
      'Minimum 2 independent directors',
      'Minimum 3 directors total',
      'Audit committee (3+ members, all independent)',
      'Audit committee financial expert',
      'Compensation committee (all independent)',
      'Governance/Nomination committee',
      'Board diversity policy',
      'Executive compensation disclosure',
      'All directors, officers, and 10%+ shareholders PIFs submitted',
    ],
    nasdaq: [
      'Audit committee (3+ members, all independent)',
      'Audit committee financial expert',
      'Compensation committee (all independent)',
      'Nominating committee (all independent)',
      'Board diversity policy',
      'SOX 404 compliance',
      'CEO attestation',
      'All directors and officers PIFs submitted',
    ],
    nyse: [
      'Majority independent board',
      'Audit committee (3+ members, all independent)',
      'Audit committee chair financial expert',
      'Compensation committee (all independent)',
      'Nominating committee (all independent)',
      'Board diversity policy',
      'Related party transaction review',
      'All directors and officers PIFs submitted',
    ],
  };

  return requirements[exchange.toLowerCase()] || requirements.tsxv;
}

function checkRequirementMet(
  requirement: string,
  composition: BoardComposition,
  directors: Director[]
): boolean {
  if (requirement.includes('Minimum 2 independent')) {
    return composition.independentDirectors >= 2;
  }
  if (requirement.includes('Minimum 3 directors')) {
    return composition.totalDirectors >= 3;
  }
  if (requirement.includes('Audit committee')) {
    return composition.auditCommitteeMembers > 0;
  }
  if (requirement.includes('financial expert')) {
    return composition.financialExpertCount > 0;
  }
  if (requirement.includes('Compensation committee')) {
    return composition.compensationCommitteeMembers > 0;
  }
  // Placeholder logic
  return Math.random() > 0.3;
}
