// Stress Test Page JavaScript

let testInterval = null;
let startTime = null;
let testDuration = 0;
let isPaused = false;

// Chart instances
let responseTimeChart = null;
let successRateChart = null;

// Initialize charts
function initializeCharts() {
    // Response Time Chart
    const rtCtx = document.getElementById('responseTimeChart').getContext('2d');
    responseTimeChart = new Chart(rtCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time (ms)',
                data: [],
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    // Success Rate Chart
    const srCtx = document.getElementById('successRateChart').getContext('2d');
    successRateChart = new Chart(srCtx, {
        type: 'doughnut',
        data: {
            labels: ['Successful', 'Failed'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    '#10b981',
                    '#ef4444'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// DOM Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const statusIndicator = document.getElementById('statusIndicator');
const logContent = document.getElementById('logContent');
const progressContainer = document.getElementById('progressContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    createFloatingDots();
    
    startBtn.addEventListener('click', startTest);
    pauseBtn.addEventListener('click', pauseTest);
    stopBtn.addEventListener('click', stopTest);
    downloadBtn.addEventListener('click', downloadReport);
    clearLogBtn.addEventListener('click', clearLog);
    
    // Real-time config updates
    document.getElementById('numUsers').addEventListener('change', updateConfig);
    document.getElementById('duration').addEventListener('change', updateConfig);
});

// Start Test
async function startTest() {
    const targetUrl = document.getElementById('targetUrl').value.trim();
    const numUsers = document.getElementById('numUsers').value;
    const duration = document.getElementById('duration').value;

    if (!targetUrl) {
        addLog('Please enter a target URL', 'error');
        return;
    }

    // Validate URL format
    try {
        new URL(targetUrl);
    } catch (e) {
        addLog('Invalid URL format. Please include http:// or https://', 'error');
        return;
    }

    // Clear previous stats
    document.getElementById('totalRequests').textContent = '0';
    document.getElementById('successfulRequests').textContent = '0';
    document.getElementById('failedRequests').textContent = '0';
    document.getElementById('avgResponseTime').textContent = '0ms';

    // Reset charts
    responseTimeChart.data.labels = [];
    responseTimeChart.data.datasets[0].data = [];
    responseTimeChart.update();

    successRateChart.data.datasets[0].data = [0, 0];
    successRateChart.update();

    try {
        addLog('🚀 Initializing stress test...', 'info');

        const response = await fetch('/api/start-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: targetUrl,
                users: numUsers,
                duration: duration,
                ramp_up: 5
            })
        });

        const data = await response.json();

        if (data.status === 'started') {
            addLog(`✅ Test started: ${numUsers} users targeting ${targetUrl}`, 'success');
            addLog(`⏱️ Duration: ${duration} seconds`, 'info');
            updateUIForRunningTest();
            startTime = Date.now();
            testDuration = parseInt(duration);
            startPolling();
            showProgress();
        } else {
            addLog(`❌ Failed to start test: ${data.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        addLog(`❌ Error starting test: ${error.message}`, 'error');
        console.error('Start test error:', error);
    }
}

// Pause/Resume Test
async function pauseTest() {
    try {
        const response = await fetch('/api/pause-test', {
            method: 'POST'
        });

        const data = await response.json();
        isPaused = data.status === 'paused';

        if (isPaused) {
            addLog('Test paused', 'warning');
            pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
            updateStatus('paused', 'Paused');
        } else {
            addLog('Test resumed', 'info');
            pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
            updateStatus('running', 'Running');
        }
    } catch (error) {
        addLog(`Error pausing test: ${error.message}`, 'error');
    }
}

// Stop Test
async function stopTest() {
    try {
        const response = await fetch('/api/stop-test', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.status === 'stopped') {
            addLog('Test stopped', 'info');
            updateUIForStoppedTest();
            stopPolling();
            hideProgress();
        }
    } catch (error) {
        addLog(`Error stopping test: ${error.message}`, 'error');
    }
}

// Update Configuration
async function updateConfig() {
    const numUsers = document.getElementById('numUsers').value;
    const duration = document.getElementById('duration').value;

    try {
        const response = await fetch('/api/update-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: numUsers,
                duration: duration
            })
        });

        const data = await response.json();
        if (data.status === 'updated') {
            addLog(`Configuration updated: ${numUsers} users, ${duration}s duration`, 'info');
            testDuration = parseInt(duration);
        }
    } catch (error) {
        console.error('Error updating config:', error);
    }
}

// Poll Test Stats
function startPolling() {
    let failureCount = 0;

    testInterval = setInterval(async () => {
        try {
            const response = await fetch('/api/test-stats');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            updateStats(data.stats);
            updateCharts(data.stats);
            updateProgress();

            // Log errors if any new ones appeared
            if (data.stats.errors && data.stats.errors.length > 0) {
                const lastError = data.stats.errors[data.stats.errors.length - 1];
                if (lastError) {
                    // Only log unique errors to avoid spam
                    const logEntries = Array.from(logContent.querySelectorAll('.log-entry'));
                    const lastLogText = logEntries[logEntries.length - 1]?.textContent || '';
                    if (!lastLogText.includes(lastError.substring(0, 30))) {
                        addLog(`⚠️ ${lastError}`, 'warning');
                    }
                }
            }

            if (!data.status.running) {
                stopPolling();
                updateUIForStoppedTest();
                addLog('✅ Test completed successfully', 'success');
                addLog(`📊 Results: ${data.stats.successful_requests} successful, ${data.stats.failed_requests} failed`, 'info');
                hideProgress();
            }

            failureCount = 0; // Reset on success
        } catch (error) {
            failureCount++;
            console.error('Error polling stats:', error);

            if (failureCount >= 3) {
                addLog('❌ Lost connection to server. Stopping test.', 'error');
                stopPolling();
                updateUIForStoppedTest();
            }
        }
    }, 1000);
}

function stopPolling() {
    if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
    }
}

// Update Stats
function updateStats(stats) {
    document.getElementById('totalRequests').textContent = stats.total_requests || 0;
    document.getElementById('successfulRequests').textContent = stats.successful_requests || 0;
    document.getElementById('failedRequests').textContent = stats.failed_requests || 0;

    const avgTime = stats.response_times.length > 0
        ? (stats.response_times.reduce((a, b) => a + b, 0) / stats.response_times.length).toFixed(2)
        : 0;
    document.getElementById('avgResponseTime').textContent = avgTime + 'ms';
}

// Update Charts
function updateCharts(stats) {
    // Update Response Time Chart
    if (stats.response_times.length > 0) {
        const lastTenTimes = stats.response_times.slice(-10);
        const labels = lastTenTimes.map((_, index) => `T${index + 1}`);

        responseTimeChart.data.labels = labels;
        responseTimeChart.data.datasets[0].data = lastTenTimes.map(t => t.toFixed(2));
        responseTimeChart.update('none');
    }

    // Update Success Rate Chart
    const total = stats.total_requests || 1;
    const successRate = stats.successful_requests;
    const failureRate = stats.failed_requests;

    successRateChart.data.datasets[0].data = [successRate, failureRate];
    successRateChart.update('none');
}

// Update Progress Bar
function updateProgress() {
    if (!startTime) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, testDuration - elapsed);
    const percentage = Math.min(100, (elapsed / testDuration) * 100);

    document.getElementById('elapsedTime').textContent = elapsed + 's';
    document.getElementById('remainingTime').textContent = remaining + 's';
    document.getElementById('progressPercent').textContent = Math.floor(percentage) + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
}

function showProgress() {
    progressContainer.style.display = 'block';
}

function hideProgress() {
    progressContainer.style.display = 'none';
}

// Update UI States
function updateUIForRunningTest() {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    downloadBtn.disabled = true;
    updateStatus('running', 'Running');
}

function updateUIForStoppedTest() {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    downloadBtn.disabled = false;
    pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
    updateStatus('ready', 'Ready');
}

function updateStatus(status, text) {
    statusIndicator.className = 'status-indicator ' + status;
    statusIndicator.querySelector('.status-text').textContent = text;
}

// Download Report
async function downloadReport() {
    try {
        addLog('Generating PDF report...', 'info');

        const response = await fetch('/api/generate-report', {
            method: 'POST'
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stress_test_report_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addLog('Report downloaded successfully', 'success');
        } else {
            addLog('Error generating report', 'error');
        }
    } catch (error) {
        addLog(`Error downloading report: ${error.message}`, 'error');
    }
}

// Log Functions
function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
}

function clearLog() {
    logContent.innerHTML = '<div class="log-entry log-info">Log cleared.</div>';
}

// Floating Dots Animation
function createFloatingDots() {
    const animatedBg = document.getElementById('animatedBg');
    const dotsCount = 30;

    for (let i = 0; i < dotsCount; i++) {
        createFloatingDot(animatedBg);
    }

    setInterval(() => createFloatingDot(animatedBg), 500);
}

function createFloatingDot(container) {
    const dot = document.createElement('div');
    dot.className = 'floating-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.animationDelay = Math.random() * 2 + 's';
    
    const size = Math.random() * 3 + 2;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';

    container.appendChild(dot);

    setTimeout(() => {
        if (dot.parentNode) {
            dot.remove();
        }
    }, 12000);
}