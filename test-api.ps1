#!/usr/bin/env pwsh

# Invoicing System - API Test Script
# Tests all 5 endpoints with a complete flow

$BASE_URL = "http://localhost:3000/api/v1"
$INVOICE_ID = "INV-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "🚀 Invoicing System - API Test" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Invoice ID: $INVOICE_ID" -ForegroundColor Cyan
Write-Host ""

# 1. CREATE INVOICE
Write-Host "1️⃣  Creating invoice (DRAFT)..." -ForegroundColor Yellow
$createPayload = @{
    invoiceId = $INVOICE_ID
    currency  = "USD"
    items     = @(
        @{
            id              = "ITEM-001"
            description     = "Consulting Services"
            quantity        = 10
            unitPriceAmount = 5000
        },
        @{
            id              = "ITEM-002"
            description     = "Technical Support"
            quantity        = 5
            unitPriceAmount = 2000
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $createResponse = Invoke-WebRequest -Uri "$BASE_URL/invoices" `
        -Method POST `
        -ContentType "application/json" `
        -Body $createPayload `
        -ErrorAction Stop
    
    $invoice = $createResponse.Content | ConvertFrom-Json
    Write-Host "✅ Invoice created successfully" -ForegroundColor Green
    Write-Host "   Status: $($invoice.status)" -ForegroundColor Green
    Write-Host "   Total: $($invoice.totalAmount) $($invoice.currency)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create invoice" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. ISSUE INVOICE
Write-Host "2️⃣  Issuing invoice (DRAFT→ISSUED)..." -ForegroundColor Yellow
$issuePayload = @{
    issueAt = [DateTime]::UtcNow.ToString("O")
} | ConvertTo-Json

try {
    $issueResponse = Invoke-WebRequest -Uri "$BASE_URL/invoices/$INVOICE_ID/issue" `
        -Method POST `
        -ContentType "application/json" `
        -Body $issuePayload `
        -ErrorAction Stop
    
    $invoice = $issueResponse.Content | ConvertFrom-Json
    Write-Host "✅ Invoice issued successfully" -ForegroundColor Green
    Write-Host "   Status: $($invoice.status)" -ForegroundColor Green
    Write-Host "   Issued: $($invoice.issuedAt)" -ForegroundColor Green
    Write-Host "   Due: $($invoice.dueAt)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to issue invoice" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. PAY INVOICE
Write-Host "3️⃣  Paying invoice (ISSUED→PAID)..." -ForegroundColor Yellow
try {
    $payResponse = Invoke-WebRequest -Uri "$BASE_URL/invoices/$INVOICE_ID/pay" `
        -Method POST `
        -ErrorAction Stop
    
    $invoice = $payResponse.Content | ConvertFrom-Json
    Write-Host "✅ Invoice paid successfully" -ForegroundColor Green
    Write-Host "   Status: $($invoice.status)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to pay invoice" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. TEST ERROR HANDLING - Try to void a paid invoice (should fail)
Write-Host "4️⃣  Testing error handling - try to void PAID invoice..." -ForegroundColor Yellow
try {
    $voidResponse = Invoke-WebRequest -Uri "$BASE_URL/invoices/$INVOICE_ID/void" `
        -Method POST `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed! Cannot void paid invoice" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✅ Correctly rejected with 409 Conflict" -ForegroundColor Green
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Error: $($error.error.message)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Unexpected error" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""

# 5. TEST NOT FOUND
Write-Host "5️⃣  Testing error handling - get non-existent invoice..." -ForegroundColor Yellow
$nonExistentId = "NONEXISTENT-$(Get-Random)"
try {
    $getResponse = Invoke-WebRequest -Uri "$BASE_URL/invoices/$nonExistentId/issue" `
        -Method POST `
        -Body '{"issueAt":"2025-12-26T00:00:00Z"}' `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed! Invoice not found" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Correctly returned 404 Not Found" -ForegroundColor Green
        $error = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Error: $($error.error.message)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Unexpected error" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
