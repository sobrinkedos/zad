$ErrorActionPreference = 'Stop'

Write-Host "== Deploy Production via Supabase CLI =="

if (!(Test-Path ".env.production")) { throw ".env.production not found" }

$envs = @{}
Get-Content ".env.production" | ForEach-Object {
  if($_ -match "^\s*([A-Za-z0-9_]+)=(.*)$") { $envs[$matches[1]] = $matches[2] }
}

$projectRef = ($envs['MCP_SUPABASE_URL'] -replace 'https://','' -replace '\.supabase\.co','')
Write-Host "Project ref:" $projectRef

# Set Supabase access token from env file (avoids interactive login)
if ($envs['MCP_SUPABASE_PROJECT_TOKEN']) {
  $env:SUPABASE_ACCESS_TOKEN = $envs['MCP_SUPABASE_PROJECT_TOKEN']
  Write-Host "Using SUPABASE_ACCESS_TOKEN from .env.production"
}

supabase link --project-ref $projectRef
supabase db push
supabase functions deploy health --project-ref $projectRef

Write-Host "== Done (Production) =="
