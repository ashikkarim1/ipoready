import subprocess
import os

# Try to convert PPTX to PDF using LibreOffice from common installation paths
libreoffice_paths = [
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/opt/homebrew/bin/libreoffice',
    '/usr/local/bin/libreoffice',
    'libreoffice'
]

pdf_created = False
for lo_path in libreoffice_paths:
    try:
        result = subprocess.run([
            lo_path, '--headless', '--convert-to', 'pdf', 
            'ipoready_linkedin_campaign.pptx'
        ], capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✓ Successfully converted PPTX to PDF using {lo_path}")
            pdf_created = True
            break
        else:
            print(f"✗ Failed with {lo_path}: {result.stderr[:100]}")
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        print(f"✗ {lo_path} not available or timed out")
        continue

if pdf_created:
    # Convert PDF to individual slide images
    result = subprocess.run([
        'pdftoppm', '-jpeg', '-r', '150',
        'ipoready_linkedin_campaign.pdf', 'slide'
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✓ Successfully converted PDF to JPEG images")
        # List the created files
        import glob
        slides = sorted(glob.glob('slide-*.jpg'))
        for slide_file in slides:
            print(f"  Created: {slide_file}")
    else:
        print(f"✗ PDF conversion failed: {result.stderr}")
else:
    print("\n⚠ LibreOffice not available for PPTX→PDF conversion")
    print("The PPTX file is ready to use:")
    print("  - Open in PowerPoint or Google Slides")
    print("  - Export individual slides as PNG/JPG")
    print("  - Or use the PPTX directly for sharing")
