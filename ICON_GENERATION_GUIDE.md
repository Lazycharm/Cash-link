# Icon Generation Guide for CashLink PWA

## Required Icon Sizes

You need to create icons in the following sizes for your PWA to work properly on all devices:

### Android Icons (Required)
- **192x192** - Android home screen icon
- **512x512** - Android splash screen and Play Store

### Additional Sizes (Recommended)
- **72x72** - Android
- **96x96** - Android
- **128x128** - Android
- **144x144** - Android
- **152x152** - iOS
- **180x180** - iOS
- **384x384** - Android

### Apple iOS Icons (Optional but Recommended)
- **57x57** - iOS
- **60x60** - iOS
- **72x72** - iOS
- **76x76** - iOS
- **114x114** - iOS
- **120x120** - iOS

## How to Generate Icons

### Method 1: Online Tools (Easiest)

1. **PWA Asset Generator** (Recommended)
   - Go to: https://www.pwabuilder.com/imageGenerator
   - Upload your `logo.png` (should be at least 512x512)
   - Download the generated icons
   - Extract and place in `public/icons/` folder

2. **RealFaviconGenerator**
   - Go to: https://realfavicongenerator.net/
   - Upload your logo
   - Configure settings
   - Download and extract to `public/icons/`

### Method 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Create icons directory
mkdir -p public/icons

# Generate all sizes from logo.png
convert public/logo.png -resize 57x57 public/icons/icon-57x57.png
convert public/logo.png -resize 60x60 public/icons/icon-60x60.png
convert public/logo.png -resize 72x72 public/icons/icon-72x72.png
convert public/logo.png -resize 76x76 public/icons/icon-76x76.png
convert public/logo.png -resize 96x96 public/icons/icon-96x96.png
convert public/logo.png -resize 114x114 public/icons/icon-114x114.png
convert public/logo.png -resize 120x120 public/icons/icon-120x120.png
convert public/logo.png -resize 128x128 public/icons/icon-128x128.png
convert public/logo.png -resize 144x144 public/icons/icon-144x144.png
convert public/logo.png -resize 152x152 public/icons/icon-152x152.png
convert public/logo.png -resize 180x180 public/icons/icon-180x180.png
convert public/logo.png -resize 192x192 public/icons/icon-192x192.png
convert public/logo.png -resize 384x384 public/icons/icon-384x384.png
convert public/logo.png -resize 512x512 public/icons/icon-512x512.png
```

### Method 3: Using Node.js Script

Create a script to generate icons:

```javascript
// generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512];
const input = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

// Create icons directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons
sizes.forEach(size => {
  sharp(input)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`Generated icon-${size}x${size}.png`))
    .catch(err => console.error(`Error generating ${size}x${size}:`, err));
});
```

Run with:
```bash
npm install sharp
node generate-icons.js
```

## Icon Requirements

### Design Guidelines

1. **Square Format**: All icons must be square (same width and height)
2. **No Transparency**: Android icons should not have transparency (use solid background)
3. **Safe Zone**: Keep important content in the center 80% of the icon
4. **High Quality**: Use PNG format with high resolution
5. **Consistent Design**: All sizes should look similar

### File Naming

Icons must be named exactly as:
- `icon-{size}x{size}.png`
- Example: `icon-192x192.png`, `icon-512x512.png`

### File Location

All icons must be placed in:
```
public/icons/
```

## Quick Start (Using PWA Builder)

1. **Prepare your logo:**
   - Ensure `public/logo.png` is at least 512x512 pixels
   - Logo should be square or can be cropped to square

2. **Generate icons:**
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload `public/logo.png`
   - Click "Generate"
   - Download the zip file

3. **Extract and place:**
   - Extract the downloaded zip
   - Copy all PNG files to `public/icons/` folder
   - Ensure filenames match the required format

4. **Verify:**
   - Check that `public/icons/icon-192x192.png` exists
   - Check that `public/icons/icon-512x512.png` exists
   - Verify all other sizes are present

## Testing Icons

After generating icons:

1. Build your app: `npm run build`
2. Check `dist/icons/` folder - icons should be there
3. Test on Android device:
   - Open your app URL
   - Try "Add to Home Screen"
   - Verify icon appears correctly

## Troubleshooting

**Icons not showing:**
- Check file paths are correct
- Verify filenames match exactly
- Ensure icons are in `public/icons/` not `src/`
- Clear browser cache and rebuild

**Icons look blurry:**
- Ensure source image is high resolution
- Use PNG format (not JPG)
- Don't upscale small images

**Icons not installing:**
- Verify manifest.json references icons correctly
- Check service worker is registered
- Ensure HTTPS is enabled
