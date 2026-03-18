# Testing: Feature World 3D Interactive Page

## Overview
Single-file Three.js 3D game (`index.html`) with no build step. Uses CDN-loaded Three.js via importmap.

## Setup
1. Serve the repo directory via local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in Chrome

## Controls
- **Keyboard**: WASD or Arrow keys for movement, Space for jump
- **On-screen D-pad**: Lower-left corner (pointer events)
- **Jump button**: Lower-right corner

## Testing Notes

### Movement Testing
- The `hold_key` computer action may not register reliably with requestAnimationFrame-based games
- **Preferred approach**: Use the on-screen D-pad buttons with `mouse_move` + `left_mouse_down` / `left_mouse_up` for sustained movement
- The character moves relatively slowly (baseSpeed=0.12), so reaching distant collectibles takes sustained movement

### Collectible Pickup Testing
- Collectibles are scattered across a 200x200 area and may be far from the spawn point
- Navigating to a collectible manually can take a long time
- **Workaround**: Temporarily add a teleport helper (e.g., press 'T' to teleport to nearest collectible) to the source code for testing, then revert before committing
- Collectibles have a collision radius of 2.0 units
- After pickup: collectible disappears, particles burst, notification appears at top-center, HUD updates

### Effects to Verify
- Speed Boost (orange, 5s) / Slow Down (blue, 5s): Check HUD speed multiplier
- Invisibility (gray, 4s): Character meshes become invisible
- Giant Mode (magenta, 5s) / Tiny Mode (cyan, 5s): Character scale changes visibly
- Super Jump (yellow, 6s): Jump height increases
- Disco Mode (pink, 5s): Sky background cycles colors
- Low Gravity (light green, 6s): Slower fall speed

### Console Errors
- WebGL GPU stall warnings (`ReadPixels`) are normal driver warnings, not application errors
- `favicon.ico` 404 is expected (no favicon provided)
- No application-level JS errors should appear

### Known Limitations
- `browser_console` tool may report "Chrome is not in the foreground" even when Chrome appears focused; use D-pad buttons or temporary code modifications as alternatives
- Character can walk off the 300x300 terrain edge (no boundary clamping)
- Effect timer race conditions exist when picking up two of the same effect type rapidly

## Devin Secrets Needed
None - this is a fully self-contained static HTML page with no authentication required.
