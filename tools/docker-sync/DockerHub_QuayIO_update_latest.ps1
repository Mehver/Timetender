$repo = 'titanrgb/timetender'
Write-Host "Tags exist in DockerHub:"
$tags = (Invoke-WebRequest -Uri "https://hub.docker.com/v2/repositories/$repo/tags/" | ConvertFrom-Json).results.name
$tags | ForEach-Object { Write-Host $_ }
$tag = Read-Host "Tag to latest"
docker tag "${repo}:${tag}" "${repo}:latest"
docker push "${repo}:latest"
docker tag "${repo}:latest" "quay.io/${repo}:latest"
docker push "quay.io/${repo}:latest"
docker tag "quay.io/${repo}:latest" "${repo}:${tag}"
Write-Host "Press any key to exit..."
[void][System.Console]::ReadKey($true)