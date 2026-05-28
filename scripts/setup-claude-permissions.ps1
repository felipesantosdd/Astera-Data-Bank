# setup-claude-permissions.ps1
# Atualiza o settings.json GLOBAL do Claude Code com todas as permissoes
# necessarias para desenvolvimento neste projeto.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-claude-permissions.ps1
#
# O que faz:
#   - Cria ~/.claude/settings.json se nao existir
#   - Adiciona todas as permissoes sem sobrescrever o que ja estava la

$claudeDir  = Join-Path $env:USERPROFILE ".claude"
$settingsFile = Join-Path $claudeDir "settings.json"

# Permissoes a garantir (formato Claude Code)
$permsToAdd = @(
  # ── Navegacao e leitura ──────────────────────────────────────────────
  "Bash(ls *)",
  "Bash(dir *)",
  "Bash(find *)",
  "Bash(cat *)",
  "Bash(head *)",
  "Bash(tail *)",
  "Bash(echo *)",
  "Bash(cd *)",
  "Bash(pwd)",

  # ── Busca de texto ────────────────────────────────────────────────────
  "Bash(grep *)",
  "Bash(rg *)",

  # ── Git ───────────────────────────────────────────────────────────────
  "Bash(git status *)",
  "Bash(git diff *)",
  "Bash(git log *)",
  "Bash(git add *)",
  "Bash(git commit *)",
  "Bash(git push *)",
  "Bash(git pull *)",
  "Bash(git checkout *)",
  "Bash(git branch *)",
  "Bash(git restore *)",
  "Bash(git rm *)",
  "Bash(git stash *)",
  "Bash(git fetch *)",

  # ── Node / npm / npx ─────────────────────────────────────────────────
  "Bash(node *)",
  "Bash(npm *)",
  "Bash(npx *)",

  # ── Python ────────────────────────────────────────────────────────────
  "Bash(python *)",
  "Bash(python3 *)",
  "Bash(pip *)",
  "Bash(pip3 *)",

  # ── Java / Maven ──────────────────────────────────────────────────────
  "Bash(java *)",
  "Bash(mvn *)",
  "Bash(mvnw *)",
  "Bash(mvnw.cmd *)",
  "Bash(./mvnw *)",
  "Bash(./mvnw.cmd *)",

  # ── Download / rede ───────────────────────────────────────────────────
  "Bash(curl *)",
  "Bash(wget *)",
  "Bash(Invoke-WebRequest *)",
  "Bash(Invoke-RestMethod *)",

  # ── PowerShell / processos ────────────────────────────────────────────
  "Bash(powershell *)",
  "Bash(Get-Process *)",
  "Bash(Stop-Process *)",
  "Bash(Start-Process *)",
  "Bash(Get-Content *)",
  "Bash(Set-Location *)",
  "Bash(Select-Object *)",
  "Bash(Start-Sleep *)",
  "Bash(netstat *)",
  "Bash(tasklist *)",
  "Bash(taskkill *)",

  # ── Ferramentas de build / misc ───────────────────────────────────────
  "Bash(make *)",
  "Bash(docker *)",
  "Bash(jq *)",
  "Bash(tar *)",
  "Bash(unzip *)",
  "Bash(cp *)",
  "Bash(mv *)",
  "Bash(mkdir *)",
  "Bash(touch *)",

  # ── Ferramentas Claude nativas ────────────────────────────────────────
  "WebFetch",
  "WebSearch"
)

# ── Le settings existente ou cria vazio ──────────────────────────────────
if (-not (Test-Path $claudeDir)) {
  New-Item -ItemType Directory -Path $claudeDir | Out-Null
}

$current = if (Test-Path $settingsFile) {
  Get-Content $settingsFile -Raw | ConvertFrom-Json
} else {
  [PSCustomObject]@{ permissions = [PSCustomObject]@{ allow = @() } }
}

# Garante que a estrutura existe
if (-not $current.permissions) {
  $current | Add-Member -NotePropertyName permissions -NotePropertyValue ([PSCustomObject]@{ allow = @() })
}
if (-not $current.permissions.allow) {
  $current.permissions | Add-Member -NotePropertyName allow -NotePropertyValue @() -Force
}

# Faz merge (adiciona apenas o que ainda nao esta la)
$existing = @($current.permissions.allow)
$added    = 0

foreach ($perm in $permsToAdd) {
  if ($existing -notcontains $perm) {
    $existing += $perm
    $added++
  }
}

$current.permissions.allow = $existing

# Salva
$current | ConvertTo-Json -Depth 10 | Set-Content $settingsFile -Encoding utf8
Write-Host ""
Write-Host "Claude Code - Permissoes configuradas" -ForegroundColor Green
Write-Host "  Arquivo : $settingsFile"
Write-Host "  Adicionadas : $added novas permissoes"
Write-Host "  Total   : $($existing.Count) permissoes"
Write-Host ""
Write-Host "Reinicie o Claude Code para aplicar." -ForegroundColor Yellow
