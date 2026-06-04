# Resume Upload API - Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Verify migration `023_board_member_files.sql` has been applied
- [ ] Check that `director_resumes` table exists in Neon database
- [ ] Verify all indexes are created:
  - `idx_director_resumes_professional_id`
  - `idx_director_resumes_verified_at`
  - `idx_director_resumes_verification_status`
  - `idx_director_resumes_is_current`
  - `idx_director_resumes_uploaded_at`
  - `idx_director_resumes_file_hash`
  - `idx_director_resumes_professional_verified`
  - `idx_director_resumes_pending_verification`
- [ ] Confirm all constraints are in place:
  - Foreign key to `professionals` table
  - Unique constraint on `(professional_id, is_current)` where `is_current = TRUE`
- [ ] Verify trigger `trigger_director_resumes_updated_at` exists

### File System Setup
- [ ] Create `/public/resumes/` directory
- [ ] Set permissions: `755` (rwxr-xr-x)
- [ ] Ensure write access for web server user
- [ ] Create `.gitignore` entry: `public/resumes/*` (keep uploaded files out of git)
- [ ] Set up backup strategy for resume files
- [ ] Configure CDN/S3 if using cloud storage (optional)

### Environment Variables
- [ ] Set `DATABASE_URL` to production Neon database
- [ ] Set `ANTHROPIC_API_KEY` if using Claude AI extraction (optional)
- [ ] Verify NextAuth configuration is in place
- [ ] Check session secret is set

### Dependencies
- [ ] Verify `pdf-parse` is installed: `npm ls pdf-parse`
- [ ] Verify `office-text-extractor` is installed: `npm ls office-text-extractor`
- [ ] Verify `@anthropic-ai/sdk` is installed (if using AI)
- [ ] Run `npm install` if any dependencies are missing

### Code Review
- [ ] Review all 4 API endpoint implementations
- [ ] Review utility functions in `resume-utils.ts`
- [ ] Check error handling is consistent
- [ ] Verify authentication checks on all endpoints
- [ ] Review database queries for SQL injection prevention

## Deployment

### Build and Test
- [ ] Run `npm run build` and verify no errors
- [ ] Run `npm run test` for resume API tests
- [ ] Verify TypeScript compilation succeeds
- [ ] Test locally with sample resume files
- [ ] Test upload, download, delete, extract workflows

### Manual Testing
- [ ] Upload a PDF resume
  - [ ] Verify file is saved to `/public/resumes/`
  - [ ] Verify database record is created
  - [ ] Verify text extraction occurs
  - [ ] Verify response includes resumeId and fileUrl
- [ ] Upload a DOCX resume
  - [ ] Verify extraction works for DOCX
  - [ ] Verify page count is detected (if applicable)
- [ ] Download resume
  - [ ] Verify file is served with correct MIME type
  - [ ] Verify download filename is correct
- [ ] Extract text with pattern matching
  - [ ] Verify data is extracted
  - [ ] Check confidence score is reasonable
- [ ] Extract text with Claude AI (if enabled)
  - [ ] Verify accuracy is better than pattern matching
  - [ ] Check API calls are within rate limits
- [ ] Delete resume
  - [ ] Verify file is removed from disk
  - [ ] Verify database record is deleted
  - [ ] Verify next version becomes current
- [ ] Test error cases
  - [ ] Upload file that's too large
  - [ ] Upload unsupported file type
  - [ ] Request non-existent resume
  - [ ] Test authentication failure

### Performance Baseline
- [ ] Measure upload time for typical 2-page PDF
- [ ] Measure text extraction time
- [ ] Measure database query times
- [ ] Verify memory usage is reasonable
- [ ] Check for any database connection leaks

### Security Verification
- [ ] Verify authentication is required
- [ ] Test authorization (can't access other users' resumes)
- [ ] Verify file size limits are enforced
- [ ] Verify file type validation works
- [ ] Test path traversal protection (try `../../../etc/passwd`)
- [ ] Verify no sensitive data in error messages
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify CORS headers are correct (if needed)

### Logging and Monitoring
- [ ] Verify error logs are being captured
- [ ] Check that uploads are logged (without exposing sensitive data)
- [ ] Verify failed extractions are logged
- [ ] Set up alerts for:
  - Failed uploads
  - Database connection errors
  - File system errors
  - API rate limits

### Documentation
- [ ] Update team wiki with API documentation
- [ ] Create user guide for resume upload
- [ ] Document troubleshooting steps
- [ ] Add examples to developer documentation
- [ ] Update architecture diagrams if applicable

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Monitor error logs for any issues
- [ ] Check database for valid records
- [ ] Verify file system has uploaded files
- [ ] Monitor API response times
- [ ] Check for any out-of-memory errors
- [ ] Verify text extraction quality

### Monitoring (First Week)
- [ ] Track upload success rate
- [ ] Monitor extraction accuracy
- [ ] Check for common errors
- [ ] Review user feedback
- [ ] Analyze performance metrics
- [ ] Look for any security incidents

### Maintenance Tasks
- [ ] Schedule daily backups of uploaded resumes
- [ ] Set up periodic cleanup of failed uploads
- [ ] Monitor database growth
- [ ] Plan for scaling if needed
- [ ] Review and update rate limiting if needed

## Rollback Plan

If issues arise post-deployment:

1. **Stop accepting uploads**
   - Temporarily disable upload endpoint
   - Redirect users to alternative process

2. **Investigate issues**
   - Check error logs
   - Review database state
   - Test with sample files

3. **Rollback steps**
   - Revert code to previous version
   - Clear problematic database records if needed
   - Delete incomplete uploads from `/public/resumes/`
   - Restart application

4. **Communicate with users**
   - Notify about service disruption
   - Provide timeline for resolution
   - Offer alternative process if needed

## Health Check Endpoints (Optional)

Consider adding health check endpoints:

```typescript
// GET /api/directors-officers/health
// Returns: { status: "ok", database: "connected", storage: "writable" }
```

## Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| Upload (2-page PDF) | < 5s | |
| Text extraction | < 1s | |
| AI extraction | < 10s | |
| Database query | < 100ms | |
| File download | < 200ms | |
| Delete operation | < 500ms | |

## Capacity Planning

Current setup can handle:
- **100 directors** at 2 resumes each = 200 files
- **Average file size**: 500KB
- **Total storage**: ~100MB
- **Backup strategy**: Daily backups recommended
- **Database growth**: ~1KB per director record

For **1000+ directors**, consider:
- [ ] Move to cloud storage (S3, GCS)
- [ ] Implement resume versioning limits
- [ ] Add compression for old versions
- [ ] Implement CDN caching

## Success Criteria

Deployment is successful when:
- [ ] All 4 endpoints are responding correctly
- [ ] File uploads work with PDF, DOCX, DOC formats
- [ ] Text extraction produces reasonable results
- [ ] Database records are created and updated correctly
- [ ] All error cases are handled gracefully
- [ ] Security requirements are met
- [ ] Performance is acceptable
- [ ] No errors in logs for 24 hours
- [ ] Users can successfully upload and download resumes

## Contacts and Escalation

| Issue | Contact | Response Time |
|-------|---------|----------------|
| Database issues | Database team | 1 hour |
| File system issues | DevOps team | 30 min |
| API errors | Backend team | 15 min |
| Security concerns | Security team | 30 min |
| Performance issues | Performance team | 1 hour |

## Sign-Off

- [ ] Backend Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

## Notes

```
[Use this section for any additional notes, decisions made, or issues encountered]



```

---

**Last Updated**: June 4, 2026
**Version**: 1.0
**Next Review**: After 1 week of deployment
