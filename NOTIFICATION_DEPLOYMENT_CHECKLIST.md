# Notification Preferences System - Deployment Checklist

## Overview
Complete checklist for deploying the notification preferences system to production.

## Phase 1: Database Setup (Pre-Deployment)

### Create Tables
- [ ] Log into Neon console
- [ ] Open SQL editor
- [ ] Copy SQL from `docs/NOTIFICATION_SCHEMA.md`
- [ ] Create `notification_preferences` table
- [ ] Create `notification_settings` table
- [ ] Create indexes on both tables
- [ ] Verify tables exist with `\dt notification_*`
- [ ] Test insert/select on both tables

### Verify Schema
- [ ] Check column names match expected
- [ ] Verify data types are correct
- [ ] Confirm indexes are created
- [ ] Test unique constraints work

## Phase 2: Code Deployment

### Verify Files Exist
- [ ] `src/lib/notification-types.ts` - Type definitions
- [ ] `src/lib/preferences.ts` - Core logic
- [ ] `src/lib/time-utils.ts` - Timezone utilities
- [ ] `src/lib/notification-guard.ts` - Guard function
- [ ] `src/app/api/notifications/preferences/route.ts` - Main endpoint
- [ ] `src/app/api/notifications/preferences/[type]/route.ts` - Single type endpoint
- [ ] `src/app/api/notifications/digest-time/route.ts` - Digest time endpoint
- [ ] `src/components/NotificationPreferences/PreferencesModal.tsx` - Main component
- [ ] `src/components/NotificationPreferences/PreferenceRow.tsx` - Row component
- [ ] `src/components/NotificationPreferences/QuietHoursSettings.tsx` - Quiet hours
- [ ] `src/components/NotificationPreferences/DigestTimeSelector.tsx` - Digest time
- [ ] `src/components/NotificationPreferences/index.ts` - Exports

### TypeScript Compilation
- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Check that notification code has no issues
- [ ] Review build output for warnings

### Install Dependencies
- [ ] Verify `date-fns-tz` is in package.json
- [ ] Run `npm install` (already done: `npm install date-fns-tz`)
- [ ] Verify all dependencies resolve

## Phase 3: Account Page Integration

### Update Account Page
- [ ] Open `src/app/account/page.tsx`
- [ ] Import `PreferencesModal` from components
- [ ] Add state variable for preferences modal visibility
- [ ] Add button in Notifications tab to open modal
- [ ] Add `<PreferencesModal>` component at end of file
- [ ] Pass `userId={session?.user?.id}` to modal
- [ ] Save file

### Test UI Integration
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `/account` page
- [ ] Click "Notifications" tab
- [ ] Verify button appears
- [ ] Click button and verify modal opens
- [ ] Click close button and verify modal closes
- [ ] Check browser console for errors

## Phase 4: API Testing

### Test Preferences Endpoints
- [ ] Test `GET /api/notifications/preferences`
  - [ ] Verify returns preferences object
  - [ ] Verify returns settings object
  - [ ] Check for 401 error without auth
- [ ] Test `GET /api/notifications/preferences/task_due`
  - [ ] Verify returns single preference
  - [ ] Check 404 for invalid type
- [ ] Test `PUT /api/notifications/preferences/task_due`
  - [ ] Update emailEnabled to false
  - [ ] Verify change persists on GET
- [ ] Test `POST /api/notifications/preferences`
  - [ ] Bulk update multiple types
  - [ ] Update settings
  - [ ] Verify all changes persist
- [ ] Test `POST /api/notifications/digest-time`
  - [ ] Set digest time to 08:00
  - [ ] Verify timezone validation
  - [ ] Verify time format validation

### Test with cURL
```bash
# Get all preferences
curl -X GET http://localhost:3000/api/notifications/preferences

# Update single preference
curl -X PUT http://localhost:3000/api/notifications/preferences/task_due \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": false}'

# Set digest time
curl -X POST http://localhost:3000/api/notifications/digest-time \
  -H "Content-Type: application/json" \
  -d '{"digestTime": "08:00", "digestTimezone": "America/New_York"}'
```

## Phase 5: UI Component Testing

### Test PreferencesModal
- [ ] Modal opens on button click
- [ ] Modal closes on X button
- [ ] Modal closes on background click
- [ ] Loading state shows on first open
- [ ] Tabs switch between "Notification Types" and "Settings"
- [ ] Success message shows after save

### Test PreferenceRow
- [ ] Toggle each channel (Email, SMS, Push, WhatsApp)
- [ ] Change frequency dropdown
- [ ] Visual feedback on toggle
- [ ] Changes save when modal saves

### Test QuietHoursSettings
- [ ] Timezone selector opens
- [ ] Can select different timezone
- [ ] Time pickers work
- [ ] Changes save in real-time

### Test DigestTimeSelector
- [ ] Preset times work
- [ ] Custom time picker works
- [ ] Timezone selector works
- [ ] Changes save in real-time

## Phase 6: Service Integration

### Email Service
- [ ] Import `shouldSendNotification` from preferences
- [ ] Import `NotificationType` and `NotificationChannel`
- [ ] Call guard function before sending email
- [ ] Handle `allowed: false` case
- [ ] Handle `shouldDigest: true` case (queue for digest)
- [ ] Test that disabled emails don't send

### WhatsApp Service
- [ ] Import guard function
- [ ] Call before sending WhatsApp message
- [ ] Test that disabled messages don't send
- [ ] Verify quiet hours block messages

### SMS Service
- [ ] Import guard function
- [ ] Call before sending SMS
- [ ] Test that disabled SMS don't send

### Push Notification Service
- [ ] Import guard function
- [ ] Call before sending push
- [ ] Test that disabled push don't send

## Phase 7: Digest Email Job (Background)

### Set Up Background Job
- [ ] Create digest email worker (cron or scheduled job)
- [ ] Schedule daily at digest time
- [ ] Query notifications queued for digest
- [ ] Group by user
- [ ] Generate digest HTML template
- [ ] Send via email service
- [ ] Mark notifications as sent
- [ ] Handle errors gracefully

### Digest Job Testing
- [ ] Manually trigger digest job
- [ ] Verify digest email generated correctly
- [ ] Verify digest sent to correct email
- [ ] Check digest email includes all types
- [ ] Verify quiet hours respected

## Phase 8: Testing & QA

### Manual Testing
- [ ] Create test user account
- [ ] Open preferences modal
- [ ] Disable email for task_due
- [ ] Trigger task_due event
- [ ] Verify no email sent
- [ ] Re-enable email
- [ ] Trigger task_due event
- [ ] Verify email sent
- [ ] Test quiet hours blocking
- [ ] Test digest queuing

### Timezone Testing
- [ ] Change timezone to America/New_York
- [ ] Set quiet hours 22:00-08:00
- [ ] Verify quiet hours respect timezone
- [ ] Set digest time to 08:00
- [ ] Verify digest sends at 08:00 New York time

### Edge Cases
- [ ] Test with midnight-spanning quiet hours (22:00-08:00)
- [ ] Test DST transitions
- [ ] Test very close to digest time boundary
- [ ] Test invalid timezone (verify error)
- [ ] Test invalid time format (verify error)

### Error Handling
- [ ] Test with no preferences (verify defaults)
- [ ] Test with deleted user (verify clean)
- [ ] Test with invalid notification type
- [ ] Check error messages are helpful
- [ ] Verify no 500 errors on bad input

## Phase 9: Monitoring & Alerts

### Set Up Monitoring
- [ ] Log all preference changes to audit table
- [ ] Monitor API error rates
- [ ] Alert on unusual activity
- [ ] Track API response times
- [ ] Monitor database query performance

### Key Metrics
- [ ] API endpoint response times (target <100ms)
- [ ] Error rate (target <0.1%)
- [ ] Database query latency
- [ ] Email delivery success rate

## Phase 10: Documentation

### Verify Documentation
- [ ] NOTIFICATION_QUICKSTART.md - Complete and accurate
- [ ] NOTIFICATION_SCHEMA.md - SQL matches database
- [ ] NOTIFICATION_API.md - Endpoints documented
- [ ] NOTIFICATION_IMPLEMENTATION.md - Setup guide clear
- [ ] NOTIFICATION_SYSTEM_README.md - Overview correct

### Create Runbook
- [ ] Document how to add new notification type
- [ ] Document how to troubleshoot common issues
- [ ] Document database backup/restore
- [ ] Document rollback procedure

## Phase 11: Staging Deployment

### Deploy to Staging
- [ ] Merge code to staging branch
- [ ] Deploy to staging environment
- [ ] Verify database tables exist in staging
- [ ] Run full test suite
- [ ] Verify API endpoints work
- [ ] Test with real data

### Staging QA
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Load testing
- [ ] User acceptance testing

### Sign-Off
- [ ] Get QA approval
- [ ] Get product manager approval
- [ ] Get security review (if needed)

## Phase 12: Production Deployment

### Pre-Production Checklist
- [ ] All tests passing
- [ ] Staging approved
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] On-call team notified

### Production Deployment
- [ ] Deploy code to production
- [ ] Verify database tables exist
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Monitor API latency
- [ ] Check email service integration

### Post-Deployment
- [ ] Verify preferences modal works
- [ ] Test API endpoints
- [ ] Check email notifications send
- [ ] Monitor for 24 hours
- [ ] Gather user feedback

## Phase 13: Post-Launch

### First 24 Hours
- [ ] Monitor error rates (should be <0.1%)
- [ ] Check API latency (should be <100ms)
- [ ] Verify digest emails sending
- [ ] Check no unexpected database errors
- [ ] Watch for user complaints

### First Week
- [ ] Gather user feedback
- [ ] Identify any issues
- [ ] Monitor performance metrics
- [ ] Check email delivery rates
- [ ] Review error logs

### First Month
- [ ] Analyze usage patterns
- [ ] Optimize based on real usage
- [ ] Update documentation if needed
- [ ] Plan next phase features

## Rollback Procedures

### If Major Issue Found
1. [ ] Identify the issue
2. [ ] Create hotfix branch
3. [ ] Implement fix
4. [ ] Test thoroughly
5. [ ] Deploy hotfix
6. [ ] Verify fix works

### If Database Issue Found
1. [ ] Take database backup
2. [ ] Run data fix queries
3. [ ] Verify data integrity
4. [ ] Restart affected services
5. [ ] Monitor for issues

### If Complete Rollback Needed
1. [ ] Revert code deployment
2. [ ] Verify API endpoints still work
3. [ ] Drop new preference data (if needed)
4. [ ] Restore from backup (if needed)
5. [ ] Test thoroughly before re-enabling

## Final Verification

- [ ] All tests passing
- [ ] No outstanding bugs
- [ ] Documentation complete
- [ ] Team trained on system
- [ ] Monitoring configured
- [ ] On-call procedures documented
- [ ] Rollback plan clear
- [ ] User communication sent

## Sign-Off

- [ ] Engineering Lead: _______________
- [ ] QA Lead: _______________
- [ ] Product Manager: _______________
- [ ] DevOps: _______________

## Deployment Date: _______________

## Notes

Use this space for any special notes about the deployment:

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

---

## After Deployment

Track these metrics for the first week:
- API error rate: ________
- Average response time: ________
- Digest email delivery rate: ________
- User feedback: ________
- Issues found: ________
- Performance notes: ________
