#!/bin/bash
# Hook: fires after writing a new controller file, checks for observability

input=$(cat)

# Extract file path and content
file_path=$(echo "$input" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('path', '') or data.get('file_path', ''))
except:
    print('')
" 2>/dev/null)

file_content=$(echo "$input" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('contents', '') or data.get('new_string', ''))
except:
    print('')
" 2>/dev/null)

# Only act on new backend controller files
if ! echo "$file_path" | grep -q "apps/backend.*controller\.ts"; then
  echo '{}'
  exit 0
fi

missing=""

if ! echo "$file_content" | grep -q "MetricsService\|metricsService"; then
  missing="${missing}\n- ❌ MetricsService not injected — add metrics (counter + histogram)"
fi

if ! echo "$file_content" | grep -q "new Logger\|Logger("; then
  missing="${missing}\n- ❌ Logger not initialized — add: private readonly logger = new Logger(ClassName.name)"
fi

if ! echo "$file_content" | grep -q "@ApiTags\|@ApiOperation"; then
  missing="${missing}\n- ❌ Missing Swagger decorators (@ApiTags, @ApiOperation)"
fi

if [ -n "$missing" ]; then
  echo "{
    \"additional_context\": \"⚠️  New controller created but missing observability:${missing}\nSee .cursor/skills/observability-skill/SKILL.md for the full checklist.\"
  }"
else
  echo '{
    "additional_context": "✅ Controller looks good — MetricsService, Logger and Swagger decorators are present."
  }'
fi
