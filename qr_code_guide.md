# Dynamic QR Code Canvas Rendering Guide

This document explains how dynamic QR codes are rendered client-side on the HTML5 Canvas in this application.

---

## 1. Why Client-Side Generation?

When rendering images on a canvas that users will download or copy to their clipboard, it is critical to avoid **tainting the canvas**. 
* **The Tainted Canvas Problem**: If you draw an image loaded from a foreign domain (like a public QR code API: e.g., Google Charts or QRServer) onto a canvas, the browser marks the canvas as "tainted" for security reasons. Once tainted, you can **no longer** export it using `canvas.toBlob()`, `canvas.toDataURL()`, or copy it to the clipboard using the Clipboard API.
* **The Solution**: Generating the QR code entirely locally and offline using the `qrcode` library. The modules are drawn directly onto the canvas, keeping the canvas safe and exportable. It also ensures the app remains 100% offline-compatible.

---

## 2. Implementation Workflow

### Step 1: Install the Package
The library used is `qrcode` (standard npm package):
```bash
npm install qrcode
```

### Step 2: Offscreen Rendering & Drawing
Because our main sharing card is composed dynamically on a single canvas, we generate the QR code on a separate, temporary offscreen canvas first, then paint it onto our main layout:

```javascript
import QRCode from 'qrcode';

export async function drawShareCard(mainCanvas, targetUrl) {
  const ctx = mainCanvas.getContext('2d');

  // Create offscreen canvas
  const qrCanvas = document.createElement('canvas');

  // Generate QR Code on the offscreen canvas
  await QRCode.toCanvas(qrCanvas, targetUrl, {
    margin: 1, // Compact border padding
    width: 200, // Size in pixels
    color: {
      dark: '#121212',  // Ink Charcoal module color
      light: '#FFFFFF'  // Background module color
    }
  });

  // Draw the generated QR code onto the main canvas at coordinates (X, Y)
  ctx.drawImage(qrCanvas, 140, 1440, 200, 200);
}
```

---

## 3. Customizations & Parameters

The `QRCode.toCanvas` function supports various configuration options:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `width` | `number` | `undefined` | Forces a specific canvas output size in pixels. |
| `margin` | `number` | `4` | Spacing border width (in modules). Use `1` for tight alignment. |
| `color.dark` | `string` | `#000000` | Hex/RGBA color for the QR code pixels. |
| `color.light`| `string` | `#ffffff` | Hex/RGBA color for the background. |
| `errorCorrectionLevel` | `string` | `'M'` | Error tolerance level: `L` (7%), `M` (15%), `Q` (25%), `H` (30%). |
