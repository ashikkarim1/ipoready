'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RegulatoryItem {
  id: string;
  category: 'board-composition' | 'committees' | 'independence' | 'expertise' | 'documentation';
  requirement: string;
  description?: string;
  isMet: boolean;
  daysRemaining?: number;
  critical?: boolean;
}

interface RegulatoryChecklistProps {
  exchange: string;
  items: RegulatoryItem[];
  allItemsMet: boolean;
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  'board-composition': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  committees: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  independence: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  expertise: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  documentation: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

export function RegulatoryChecklist({
  exchange,
  items,
  allItemsMet,
}: RegulatoryChecklistProps) {
  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, RegulatoryItem[]>
  );

  const completedItems = items.filter((item) => item.isMet).length;
  const completionPercentage = Math.round((completedItems / items.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{exchange.toUpperCase()} Compliance</CardTitle>
              <CardDescription>Regulatory requirements checklist</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{completionPercentage}%</div>
              <p className="text-xs text-slate-500">
                {completedItems} of {items.length} complete
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items by Category */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const colors = categoryColors[category];
          const categoryCompleted = categoryItems.filter((item) => item.isMet).length;
          const categoryTotal = categoryItems.length;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border ${colors.border} ${colors.bg}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm font-semibold ${colors.text} capitalize`}>
                      {category.replace('-', ' ')}
                    </CardTitle>
                    <span className="text-xs font-medium text-slate-600">
                      {categoryCompleted}/{categoryTotal}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categoryItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded hover:bg-white/50 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.isMet ? (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 text-slate-600">
                            {item.critical ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${item.isMet ? 'text-slate-700' : 'text-slate-900'}`}>
                          {item.requirement}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                        )}
                        {item.daysRemaining && !item.isMet && (
                          <p className="text-xs text-amber-700 mt-1">
                            {item.daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {allItemsMet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-emerald-50 border border-emerald-200 p-4"
        >
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                All {exchange.toUpperCase()} requirements met!
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Your company is ready for listing on {exchange.toUpperCase()}.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
