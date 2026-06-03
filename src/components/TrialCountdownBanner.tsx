'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface TrialCountdownBannerProps {
  trialEndDate: Date;
  companyName: string;
}

const TrialCountdownBanner = React.memo<TrialCountdownBannerProps>(
  ({ trialEndDate, companyName }) => {
    const trialMetrics = useMemo(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(
        trialEndDate.getFullYear(),
        trialEndDate.getMonth(),
        trialEndDate.getDate()
      );

      const diffTime = endDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const TRIAL_DURATION = 14;
      const percentageRemaining = Math.max(
        0,
        Math.min(100, (daysRemaining / TRIAL_DURATION) * 100)
      );

      return {
        daysRemaining: Math.max(0, daysRemaining),
        percentageRemaining,
      };
    }, [trialEndDate]);

    const getProgressBarColor = () => {
      if (trialMetrics.daysRemaining > 7) {
        return 'bg-green-500';
      } else if (trialMetrics.daysRemaining >= 3) {
        return 'bg-yellow-500';
      } else {
        return 'bg-red-500';
      }
    };

    const getBackgroundColor = () => {
      if (trialMetrics.daysRemaining > 7) {
        return 'bg-blue-50 border-blue-200';
      } else if (trialMetrics.daysRemaining >= 3) {
        return 'bg-amber-50 border-amber-200';
      } else {
        return 'bg-red-50 border-red-200';
      }
    };

    const formattedEndDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(trialEndDate);

    return (
      <div
        className={`w-full border-b-2 transition-colors duration-300 ${getBackgroundColor()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-5 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getProgressBarColor()} transition-colors duration-300`}
              initial={{ width: 0 }}
              animate={{ width: `${trialMetrics.percentageRemaining}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="h4 sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                Trial Expires Soon
              </h2>
              <p className="body-sm sm:body text-gray-700 mb-2 sm:mb-0">
                Your trial for{' '}
                <span className="font-semibold text-gray-900">{companyName}</span>{' '}
                expires in{' '}
                <span className="font-bold text-gray-900">
                  {trialMetrics.daysRemaining}{' '}
                  {trialMetrics.daysRemaining === 1 ? 'day' : 'days'}
                </span>{' '}
                ({formattedEndDate})
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/app/checkout?is_trial_upgrade=true"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap body-sm sm:body shadow-sm hover:shadow-md"
            >
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>

          {/* Mobile-only Secondary Text */}
          <p className="sm:hidden caption-sm text-gray-600 mt-3">
            Upgrade now to continue using IPOReady after your trial ends.
          </p>
        </div>
      </div>
    );
  }
);

TrialCountdownBanner.displayName = 'TrialCountdownBanner';

export { TrialCountdownBanner };
