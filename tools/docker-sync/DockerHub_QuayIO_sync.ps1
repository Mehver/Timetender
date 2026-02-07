$repo = 'titanrgb/timetender'

# Get tags from Docker Hub
Write-Host "Tags exist in DockerHub:"
$dockerHubTags = (Invoke-WebRequest -Uri "https://hub.docker.com/v2/repositories/$repo/tags/" | ConvertFrom-Json).results.name
$dockerHubTags | ForEach-Object { Write-Host $_ }

# Get tags from Quay.io
Write-Host "`nTags exist in Quay.io:"
$quayApiUrl = "https://quay.io/api/v1/repository/$repo"
$headers = @{
    'X-Requested-With' = 'XMLHttpRequest'
}
$quayIoTags = (Invoke-WebRequest -Uri "$quayApiUrl/tag/" -UseBasicParsing -Headers $headers | ConvertFrom-Json).tags.name
$quayIoTags | ForEach-Object { Write-Host $_ }

# Compare tags and sync missing ones
Write-Host "`nSyncing missing tags from Quay.io to DockerHub:"
$missingTags = $quayIoTags | Where-Object { $dockerHubTags -notcontains $_ }
if ($missingTags) {
    $missingTags | ForEach-Object {
        Write-Host "Syncing tag: $_"
        docker pull "quay.io/${repo}:${_}"
        docker tag "quay.io/${repo}:${_}" "${repo}:${_}"
        docker push "${repo}:${_}"
    }
} else {
    Write-Host "All tags are already synced."
}

Write-Host "Press any key to exit..."
[void][System.Console]::ReadKey($true)