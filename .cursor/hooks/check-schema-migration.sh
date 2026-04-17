#!/bin/bash
# Hook: fires after any file edit, checks if prisma/schema.prisma was modified

input=$(cat)

# Extract the file path from the tool input
file_path=$(echo "$input" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    path = data.get('path', '') or data.get('file_path', '')
    print(path)
except:
    print('')
" 2>/dev/null)

# Only act if schema.prisma was edited
if echo "$file_path" | grep -q "schema.prisma"; then
  echo '{
    "additional_context": "⚠️  prisma/schema.prisma was modified. Required next steps:\n1. Run: npx prisma migrate dev --name <description>\n2. Run: npx prisma generate\n3. Restart backend: docker compose restart backend\nDo NOT forget this — the app will crash if schema and DB are out of sync."
  }'
else
  echo '{}'
fi
