# Test script to trigger workbook generation
$body = @{
    topic = "Test Debugging Topic"
    gradeBand = "k-2"
    domain = "mathematics"
    options = @{
        objectiveCount = 2
        sectionCount = 2
        includeExercises = $true
        includeMisconceptions = $false
    }
} | ConvertTo-Json -Depth 3

Write-Host "🚀 Testing workbook generation..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/generate-workbook" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Response received successfully"
    Write-Host "Success: $($response.success)"
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)"
}