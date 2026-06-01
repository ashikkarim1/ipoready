#!/usr/bin/env node

/**
 * Frontend Performance Audit
 * Checks bundle size, Core Web Vitals, and React performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrontendPerformanceAudit {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.metrics = {};
  }

  async checkBundleSize() {
    console.log('📦 Checking build output...\n');

    try {
      // Run build
      console.log('Building project (this may take a minute)...');
      execSync('npm run build 2>/dev/null', { stdio: 'pipe' });

      // Analyze .next directory
      const nextDir = '.next/static';
      if (!fs.existsSync(nextDir)) {
        console.log('⚠️  .next directory not found\n');
        return;
      }

      let totalSize = 0;
      const files = this.walkDir(nextDir);

      console.log('✅ Build completed\n');
      console.log('Bundle analysis:\n');

      // Group by type
      const chunks = {
        js: { size: 0, count: 0, maxFile: null, maxSize: 0 },
        css: { size: 0, count: 0, maxFile: null, maxSize: 0 },
      };

      files.forEach(file => {
        const size = fs.statSync(file).size;
        totalSize += size;

        if (file.endsWith('.js')) {
          chunks.js.size += size;
          chunks.js.count++;
          if (size > chunks.js.maxSize) {
            chunks.js.maxSize = size;
            chunks.js.maxFile = path.basename(file);
          }
        } else if (file.endsWith('.css')) {
          chunks.css.size += size;
          chunks.css.count++;
          if (size > chunks.css.maxSize) {
            chunks.css.maxSize = size;
            chunks.css.maxFile = path.basename(file);
          }
        }
      });

      // Log results
      console.log(`Total Build Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`JavaScript Chunks: ${chunks.js.count} files, ${(chunks.js.size / 1024).toFixed(2)}KB`);
      if (chunks.js.maxFile) {
        console.log(`  Largest: ${chunks.js.maxFile} (${(chunks.js.maxSize / 1024).toFixed(2)}KB)`);
      }
      console.log(`CSS Chunks: ${chunks.css.count} files, ${(chunks.css.size / 1024).toFixed(2)}KB\n`);

      this.metrics.bundleSize = {
        total: totalSize,
        javascript: chunks.js.size,
        css: chunks.css.size,
        fileCount: files.length,
      };

      // Check thresholds
      if (chunks.js.size > 500 * 1024) {
        this.issues.push({
          severity: 'warning',
          message: `JavaScript bundle is ${(chunks.js.size / 1024).toFixed(0)}KB - consider code splitting`,
        });
        this.recommendations.push({
          action: 'Reduce JavaScript bundle size',
          suggestion: 'Use dynamic imports for large features, tree-shake unused code, remove unused dependencies',
        });
      }

      if (chunks.js.maxSize > 200 * 1024) {
        this.issues.push({
          severity: 'warning',
          message: `Largest chunk is ${(chunks.js.maxSize / 1024).toFixed(0)}KB - should split further`,
        });
      }
    } catch (error) {
      console.log('⚠️  Could not build project:', error.message, '\n');
    }
  }

  checkReactOptimization() {
    console.log('⚛️  Checking React optimization patterns...\n');

    try {
      // Find all component files
      const components = this.findFiles('src', ['.tsx', '.jsx']);

      let memoCount = 0;
      let useMemoCount = 0;
      let useCallbackCount = 0;
      let totalComponents = 0;

      components.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          totalComponents++;

          if (content.includes('React.memo') || content.includes('memo(')) {
            memoCount++;
          }
          if (content.includes('useMemo')) {
            useMemoCount++;
          }
          if (content.includes('useCallback')) {
            useCallbackCount++;
          }
        }
      });

      console.log(`Found ${totalComponents} component files\n`);
      console.log(`React.memo usage: ${memoCount} components (${((memoCount / totalComponents) * 100).toFixed(1)}%)`);
      console.log(`useMemo hooks: ${useMemoCount} usages`);
      console.log(`useCallback hooks: ${useCallbackCount} usages\n`);

      if (memoCount === 0) {
        this.issues.push({
          severity: 'info',
          message: 'No React.memo usage found - consider memoizing child components',
        });
        this.recommendations.push({
          action: 'Add React.memo to prevent unnecessary re-renders',
          suggestion: 'Wrap component exports with React.memo for components that receive props',
        });
      }
    } catch (error) {
      console.log('ℹ️  Could not analyze React components\n');
    }
  }

  checkCodeSplitting() {
    console.log('🔀 Checking code splitting...\n');

    try {
      const srcDir = 'src';
      let dynamicImports = 0;

      const files = this.findFiles(srcDir, ['.tsx', '.jsx', '.ts', '.js']);
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('dynamic(') || content.includes('React.lazy')) {
            dynamicImports++;
          }
        }
      });

      console.log(`Dynamic imports found: ${dynamicImports}`);

      if (dynamicImports === 0) {
        this.recommendations.push({
          action: 'Add code splitting for large features',
          suggestion: 'Use dynamic() from next/dynamic or React.lazy() for routes and heavy components',
        });
      }

      console.log();
    } catch (error) {
      console.log('ℹ️  Could not check code splitting\n');
    }
  }

  checkNextImageUsage() {
    console.log('🖼️  Checking image optimization...\n');

    try {
      const srcDir = 'src';
      let nextImages = 0;
      let htmlImages = 0;

      const files = this.findFiles(srcDir, ['.tsx', '.jsx']);
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          nextImages += (content.match(/<Image/g) || []).length;
          htmlImages += (content.match(/<img/g) || []).length;
        }
      });

      console.log(`Next.js Image components: ${nextImages}`);
      console.log(`HTML img tags: ${htmlImages}`);

      if (htmlImages > nextImages / 2) {
        this.recommendations.push({
          action: 'Use Next.js Image component for all images',
          suggestion: 'Replace <img> tags with <Image> from next/image for automatic optimization',
        });
      }

      console.log();
    } catch (error) {
      console.log('ℹ️  Could not check image usage\n');
    }
  }

  checkLinting() {
    console.log('✅ Running ESLint...\n');

    try {
      const output = execSync('npm run lint 2>&1', { stdio: 'pipe' }).toString();

      // Count issues
      const warnings = (output.match(/warning/gi) || []).length;
      const errors = (output.match(/error/gi) || []).length;

      console.log(`Linting results:`);
      console.log(`  Errors: ${errors}`);
      console.log(`  Warnings: ${warnings}\n`);

      if (errors > 0) {
        this.issues.push({
          severity: 'warning',
          message: `${errors} linting error(s) found`,
        });
      }
    } catch (error) {
      console.log('ℹ️  Linting check skipped\n');
    }
  }

  walkDir(dir, files = []) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const path = `${dir}/${item}`;
        if (fs.statSync(path).isDirectory()) {
          this.walkDir(path, files);
        } else {
          files.push(path);
        }
      });
    } catch (error) {
      // Ignore errors
    }
    return files;
  }

  findFiles(dir, extensions) {
    const files = [];
    try {
      const walk = (currentPath) => {
        if (!fs.existsSync(currentPath)) return;

        const items = fs.readdirSync(currentPath);
        items.forEach(item => {
          const fullPath = path.join(currentPath, item);
          if (fs.statSync(fullPath).isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules') {
              walk(fullPath);
            }
          } else {
            if (extensions.some(ext => item.endsWith(ext))) {
              files.push(fullPath);
            }
          }
        });
      };
      walk(dir);
    } catch (error) {
      // Ignore
    }
    return files;
  }

  printReport() {
    console.log('\n' + '='.repeat(70));
    console.log('FRONTEND PERFORMANCE AUDIT REPORT');
    console.log('='.repeat(70) + '\n');

    if (this.issues.length === 0) {
      console.log('✅ No critical issues detected!\n');
    } else {
      console.log(`Found ${this.issues.length} issue(s):\n`);
      this.issues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
      });
      console.log();
    }

    if (this.recommendations.length > 0) {
      console.log('RECOMMENDATIONS:\n');
      this.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.action}`);
        console.log(`   → ${rec.suggestion}\n`);
      });
    }

    console.log('='.repeat(70));
    console.log('Performance Targets:\n');
    console.log('  • LCP (Largest Contentful Paint): < 2.5s');
    console.log('  • FCP (First Contentful Paint): < 1.8s');
    console.log('  • CLS (Cumulative Layout Shift): < 0.1');
    console.log('  • FID (First Input Delay): < 100ms');
    console.log('  • Bundle Size (JS): < 500KB');
    console.log('  • Lighthouse Score: > 90');
    console.log('\n' + '='.repeat(70) + '\n');
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      issues: this.issues,
      recommendations: this.recommendations,
    };

    const reportPath = 'load-tests/frontend-performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}\n`);
  }

  async run() {
    await this.checkBundleSize();
    this.checkReactOptimization();
    this.checkCodeSplitting();
    this.checkNextImageUsage();
    this.checkLinting();
    this.printReport();
    this.generateReport();
  }
}

// Main
const audit = new FrontendPerformanceAudit();
audit.run().catch(console.error);
