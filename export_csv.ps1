
$jsonPath = "src/data/messages.json"
$csvPath = "power_words.csv"

# Read JSON content
$jsonContent = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# Select fields and export to CSV with UTF8 encoding
$jsonContent | Select-Object id, text | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

Write-Host "Successfully exported $($jsonContent.Count) items to $csvPath"
