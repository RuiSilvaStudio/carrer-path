#!/bin/bash
# Serve the career-kb dashboard locally
# Usage: bash ~/projects/career-kb/serve.sh
cd /home/rui/projects/career-kb
echo "Personality Atlas running at:"
echo "  Dashboard:  http://localhost:8765/personality-dashboard-prototype.html"
echo "  Baseline:   http://localhost:8765/baseline-assessment.html"
echo ""
echo "Press Ctrl+C to stop."
echo ""
python3 -m http.server 8765
