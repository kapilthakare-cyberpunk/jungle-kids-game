#!/bin/bash
echo ""
echo "🌿 =============================="
echo "   Jungle World Kids App"
echo "   Starting on port 8181"
echo "🌿 =============================="
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "YOUR_MAC_IP")
echo ""
echo "📺 On LG TV browser: http://$IP:8181"
echo "💻 On this Mac:      http://localhost:8181"
echo ""
echo "Press Ctrl+C to stop."
echo ""
cd "$(dirname "$0")"
python3 -m http.server 8181
