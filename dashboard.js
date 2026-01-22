// Dashboard State
let currentView = 'overview';
let charts = {};
let selectedDeal = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Update last updated time
    document.getElementById('lastUpdated').textContent = formatDateTime(window.dashboardData.lastUpdated);

    // Setup navigation
    setupNavigation();

    // Initialize overview view
    updateOverviewView();

    // Populate cluster filter
    populateClusterFilter();

    // Populate deal selectors
    populateDealSelectors();

    console.log('Dashboard initialized with', window.dashboardData.deals.length, 'deals');
}

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewName}-view`).classList.add('active');
    currentView = viewName;

    // Update view content
    switch(viewName) {
        case 'overview':
            updateOverviewView();
            break;
        case 'clusters':
            updateClustersView();
            break;
        case 'deals':
            updateDealsView();
            break;
        case 'forecast':
            updateForecastView();
            break;
    }
}

// Overview View
function updateOverviewView() {
    const stats = window.dashboardData.summaryStats;

    // Update KPIs
    document.getElementById('totalDeals').textContent = stats.totalDeals;
    document.getElementById('expectedRevenue').textContent = formatCurrency(stats.totalRevenue / 1000000) + 'M';
    document.getElementById('expectedOGM').textContent = formatCurrency(stats.totalOGM / 1000000) + 'M';
    document.getElementById('atRiskDeals').textContent = stats.atRiskDeals;

    const variancePercent = (stats.totalVariance / stats.totalOGM) * 100;
    const varianceEl = document.getElementById('ogmVariance');
    varianceEl.textContent = `${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}% vs Plan`;
    varianceEl.className = variancePercent >= 0 ? 'kpi-change positive' : 'kpi-change negative';

    // Create charts
    createClusterMarginChart();
    createAttainmentChart();

    // Populate deals table
    populateDealsTable();
}

function createClusterMarginChart() {
    const ctx = document.getElementById('clusterMarginChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.clusterMargin) {
        charts.clusterMargin.destroy();
    }

    const clusterStats = window.dashboardData.clusterStats;
    const topClusters = Object.keys(clusterStats)
        .sort((a, b) => clusterStats[b].totalOGM - clusterStats[a].totalOGM)
        .slice(0, 10);

    const data = {
        labels: topClusters.map(c => clusterStats[c].name),
        datasets: [{
            label: 'Expected OGM ($M)',
            data: topClusters.map(c => clusterStats[c].totalOGM / 1000000),
            backgroundColor: 'rgba(0, 112, 210, 0.8)',
            borderColor: 'rgba(0, 112, 210, 1)',
            borderWidth: 1
        }]
    };

    charts.clusterMargin = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `OGM: $${context.parsed.y.toFixed(2)}M`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Expected OGM ($M)'
                    }
                }
            }
        }
    });
}

function createAttainmentChart() {
    const ctx = document.getElementById('attainmentChart');
    if (!ctx) return;

    // Destroy existing chart
    if (charts.attainment) {
        charts.attainment.destroy();
    }

    const deals = window.dashboardData.deals;
    const totalForecast = deals.reduce((sum, d) => sum + d.forecastRevenue, 0);
    const totalSecured = deals.reduce((sum, d) => sum + d.securedRevenue, 0);
    const attainmentPercent = (totalSecured / (totalForecast + totalSecured)) * 100;

    const data = {
        labels: ['Secured', 'Forecast'],
        datasets: [{
            data: [totalSecured / 1000000, totalForecast / 1000000],
            backgroundColor: [
                'rgba(16, 124, 16, 0.8)',
                'rgba(255, 185, 0, 0.8)'
            ],
            borderColor: [
                'rgba(16, 124, 16, 1)',
                'rgba(255, 185, 0, 1)'
            ],
            borderWidth: 1
        }]
    };

    charts.attainment = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: $${context.parsed.toFixed(2)}M`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `${attainmentPercent.toFixed(1)}% Secured`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function populateDealsTable(filterCluster = 'all') {
    const tbody = document.getElementById('dealsTableBody');
    if (!tbody) return;

    let deals = window.dashboardData.deals;

    // Apply filter
    if (filterCluster !== 'all') {
        deals = deals.filter(d => d.cluster === filterCluster);
    }

    // Sort by total revenue descending
    deals.sort((a, b) => b.totalRevenue - a.totalRevenue);

    tbody.innerHTML = deals.map(deal => {
        const statusClass = deal.status === 'At Risk' ? 'status-risk' :
                          deal.status === 'Watch' ? 'status-watch' : 'status-track';
        const varianceClass = deal.variancePercent > 0 ? 'positive' : 'negative';

        return `
            <tr>
                <td><strong>${deal.customer}</strong></td>
                <td>${window.dashboardData.clusters[deal.cluster].name}</td>
                <td>${deal.dealId}</td>
                <td>${formatCurrency(deal.forecastRevenue / 1000000)}M</td>
                <td>${formatCurrency(deal.securedRevenue / 1000000)}M</td>
                <td><strong>${formatCurrency(deal.expectedOGM / 1000000)}M</strong></td>
                <td>${deal.ogmPercent.toFixed(1)}%</td>
                <td class="${varianceClass}">${deal.variancePercent > 0 ? '+' : ''}${deal.variancePercent.toFixed(1)}%</td>
                <td><span class="status-badge ${statusClass}">${deal.status}</span></td>
            </tr>
        `;
    }).join('');
}

function populateClusterFilter() {
    const select = document.getElementById('clusterFilter');
    if (!select) return;

    const clusterKeys = Object.keys(window.dashboardData.clusterStats).sort();
    clusterKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = window.dashboardData.clusters[key].name;
        select.appendChild(option);
    });

    select.addEventListener('change', function() {
        populateDealsTable(this.value);
    });
}

// Clusters View
function updateClustersView() {
    const container = document.getElementById('clusterGrid');
    if (!container) return;

    const clusterStats = window.dashboardData.clusterStats;
    const regions = ['EMEA', 'APJ', 'AMS'];

    container.innerHTML = regions.map(region => {
        const regionClusters = Object.keys(clusterStats)
            .filter(key => clusterStats[key].region === region)
            .sort((a, b) => clusterStats[b].totalOGM - clusterStats[a].totalOGM);

        return `
            <div class="region-section">
                <h2 class="region-title">${region}</h2>
                <div class="cluster-cards">
                    ${regionClusters.map(key => {
                        const stats = clusterStats[key];
                        const hasRisk = stats.atRiskCount > 0;
                        return `
                            <div class="cluster-card ${hasRisk ? 'has-risk' : ''}">
                                <div class="cluster-header">
                                    <h3>${stats.name}</h3>
                                    ${hasRisk ? `<span class="risk-badge">${stats.atRiskCount} At Risk</span>` : ''}
                                </div>
                                <div class="cluster-stats">
                                    <div class="stat-row">
                                        <span class="stat-label">Deals:</span>
                                        <span class="stat-value">${stats.dealCount}</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Revenue:</span>
                                        <span class="stat-value">${formatCurrency(stats.totalRevenue / 1000000)}M</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Expected OGM:</span>
                                        <span class="stat-value highlight">${formatCurrency(stats.totalOGM / 1000000)}M</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">OGM %:</span>
                                        <span class="stat-value">${stats.avgOGMPercent.toFixed(1)}%</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Variance:</span>
                                        <span class="stat-value ${stats.variance >= 0 ? 'positive' : 'negative'}">
                                            ${stats.variance > 0 ? '+' : ''}${formatCurrency(stats.variance / 1000000)}M
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Deals View
function populateDealSelectors() {
    const selectors = ['dealSelector', 'forecastDealSelector'];

    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (!select) return;

        const deals = window.dashboardData.deals.sort((a, b) =>
            a.customer.localeCompare(b.customer) || a.dealId.localeCompare(b.dealId)
        );

        deals.forEach(deal => {
            const option = document.createElement('option');
            option.value = deal.dealId;
            option.textContent = `${deal.customer} - ${deal.dealId} (${window.dashboardData.clusters[deal.cluster].name})`;
            select.appendChild(option);
        });

        if (selectorId === 'dealSelector') {
            select.addEventListener('change', function() {
                updateDealDetail(this.value);
            });
        } else {
            select.addEventListener('change', function() {
                updateForecastCharts(this.value);
            });
        }
    });
}

function updateDealsView() {
    // View is updated via selector change
}

function updateDealDetail(dealId) {
    if (!dealId) {
        document.getElementById('dealDetailContent').innerHTML = '<p class="empty-state">Select a deal to view details</p>';
        return;
    }

    const deal = window.dashboardData.deals.find(d => d.dealId === dealId);
    if (!deal) return;

    selectedDeal = deal;

    const content = document.getElementById('dealDetailContent');
    content.innerHTML = `
        <div class="deal-detail-header">
            <div>
                <h2>${deal.customer}</h2>
                <p class="deal-meta">${deal.dealId} | ${window.dashboardData.clusters[deal.cluster].name} | ${deal.region}</p>
            </div>
            <span class="status-badge ${deal.status === 'At Risk' ? 'status-risk' : deal.status === 'Watch' ? 'status-watch' : 'status-track'}">
                ${deal.status}
            </span>
        </div>

        <div class="deal-summary-grid">
            <div class="summary-card">
                <div class="summary-label">Forecast Revenue</div>
                <div class="summary-value">${formatCurrency(deal.forecastRevenue / 1000000)}M</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Secured Revenue</div>
                <div class="summary-value">${formatCurrency(deal.securedRevenue / 1000000)}M</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value highlight">${formatCurrency(deal.totalRevenue / 1000000)}M</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Expected OGM</div>
                <div class="summary-value highlight">${formatCurrency(deal.expectedOGM / 1000000)}M</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">OGM %</div>
                <div class="summary-value">${deal.ogmPercent.toFixed(1)}%</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Variance vs Plan</div>
                <div class="summary-value ${deal.variancePercent >= 0 ? 'positive' : 'negative'}">
                    ${deal.variancePercent > 0 ? '+' : ''}${deal.variancePercent.toFixed(1)}%
                </div>
            </div>
        </div>

        <div class="sku-section">
            <h3>SKU Breakdown</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>SKU ID</th>
                        <th>Category</th>
                        <th>Series</th>
                        <th>Model</th>
                        <th>Forecast Units</th>
                        <th>Secured Units</th>
                        <th>Price</th>
                        <th>Forecast Revenue</th>
                        <th>Secured Revenue</th>
                        <th>Margin %</th>
                    </tr>
                </thead>
                <tbody>
                    ${deal.skus.map(sku => {
                        const marginPercent = ((sku.forecastRevenue + sku.securedRevenue - sku.forecastCost - sku.securedCost) /
                                             (sku.forecastRevenue + sku.securedRevenue)) * 100;
                        return `
                            <tr>
                                <td><code>${sku.skuId}</code></td>
                                <td>${sku.category}</td>
                                <td>${sku.series}</td>
                                <td>${sku.model}</td>
                                <td>${sku.forecastUnits.toLocaleString()}</td>
                                <td>${sku.securedUnits.toLocaleString()}</td>
                                <td>${formatCurrency(sku.price)}</td>
                                <td>${formatCurrency(sku.forecastRevenue / 1000)}K</td>
                                <td>${formatCurrency(sku.securedRevenue / 1000)}K</td>
                                <td>${marginPercent.toFixed(1)}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Forecast View
function updateForecastView() {
    // Charts are updated via selector change
}

function updateForecastCharts(dealId) {
    if (!dealId) return;

    const deal = window.dashboardData.deals.find(d => d.dealId === dealId);
    if (!deal) return;

    // Aggregate weekly data across all SKUs
    const weeklyData = Array(13).fill(0).map((_, i) => ({
        week: i + 1,
        forecastUnits: 0,
        securedUnits: 0,
        actualUnits: 0,
        forecastRevenue: 0,
        securedRevenue: 0,
        actualRevenue: 0,
        forecastMargin: 0,
        securedMargin: 0,
        actualMargin: 0
    }));

    deal.skus.forEach(sku => {
        sku.weeklySchedule.forEach((week, idx) => {
            weeklyData[idx].forecastUnits += week.forecastUnits;
            weeklyData[idx].securedUnits += week.securedUnits;
            weeklyData[idx].actualUnits += week.actualUnits;
            weeklyData[idx].forecastRevenue += week.forecastUnits * sku.price;
            weeklyData[idx].securedRevenue += week.securedUnits * sku.price;
            weeklyData[idx].actualRevenue += week.actualUnits * sku.price;
            weeklyData[idx].forecastMargin += week.forecastUnits * (sku.price - sku.cost);
            weeklyData[idx].securedMargin += week.securedUnits * (sku.price - sku.cost);
            weeklyData[idx].actualMargin += week.actualUnits * (sku.price - sku.cost);
        });
    });

    createVolumeScheduleChart(weeklyData);
    createRevenueScheduleChart(weeklyData);
    createMarginScheduleChart(weeklyData);
}

function createVolumeScheduleChart(weeklyData) {
    const ctx = document.getElementById('volumeScheduleChart');
    if (!ctx) return;

    if (charts.volumeSchedule) {
        charts.volumeSchedule.destroy();
    }

    const data = {
        labels: weeklyData.map(w => `W${w.week}`),
        datasets: [
            {
                label: 'Actual',
                data: weeklyData.map(w => w.actualUnits),
                backgroundColor: 'rgba(16, 124, 16, 0.8)',
                borderColor: 'rgba(16, 124, 16, 1)',
                borderWidth: 1
            },
            {
                label: 'Secured',
                data: weeklyData.map(w => w.securedUnits),
                backgroundColor: 'rgba(0, 112, 210, 0.8)',
                borderColor: 'rgba(0, 112, 210, 1)',
                borderWidth: 1
            },
            {
                label: 'Forecast',
                data: weeklyData.map(w => w.forecastUnits),
                backgroundColor: 'rgba(255, 185, 0, 0.6)',
                borderColor: 'rgba(255, 185, 0, 1)',
                borderWidth: 1
            }
        ]
    };

    charts.volumeSchedule = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: false },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Units' }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function createRevenueScheduleChart(weeklyData) {
    const ctx = document.getElementById('revenueScheduleChart');
    if (!ctx) return;

    if (charts.revenueSchedule) {
        charts.revenueSchedule.destroy();
    }

    const data = {
        labels: weeklyData.map(w => `W${w.week}`),
        datasets: [
            {
                label: 'Actual',
                data: weeklyData.map(w => w.actualRevenue / 1000),
                backgroundColor: 'rgba(16, 124, 16, 0.8)',
                borderColor: 'rgba(16, 124, 16, 1)',
                borderWidth: 1
            },
            {
                label: 'Secured',
                data: weeklyData.map(w => w.securedRevenue / 1000),
                backgroundColor: 'rgba(0, 112, 210, 0.8)',
                borderColor: 'rgba(0, 112, 210, 1)',
                borderWidth: 1
            },
            {
                label: 'Forecast',
                data: weeklyData.map(w => w.forecastRevenue / 1000),
                backgroundColor: 'rgba(255, 185, 0, 0.6)',
                borderColor: 'rgba(255, 185, 0, 1)',
                borderWidth: 1
            }
        ]
    };

    charts.revenueSchedule = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: false },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Revenue ($K)' }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function createMarginScheduleChart(weeklyData) {
    const ctx = document.getElementById('marginScheduleChart');
    if (!ctx) return;

    if (charts.marginSchedule) {
        charts.marginSchedule.destroy();
    }

    const data = {
        labels: weeklyData.map(w => `W${w.week}`),
        datasets: [
            {
                label: 'Actual',
                data: weeklyData.map(w => w.actualMargin / 1000),
                backgroundColor: 'rgba(16, 124, 16, 0.8)',
                borderColor: 'rgba(16, 124, 16, 1)',
                borderWidth: 1
            },
            {
                label: 'Secured',
                data: weeklyData.map(w => w.securedMargin / 1000),
                backgroundColor: 'rgba(0, 112, 210, 0.8)',
                borderColor: 'rgba(0, 112, 210, 1)',
                borderWidth: 1
            },
            {
                label: 'Forecast',
                data: weeklyData.map(w => w.forecastMargin / 1000),
                backgroundColor: 'rgba(255, 185, 0, 0.6)',
                borderColor: 'rgba(255, 185, 0, 1)',
                borderWidth: 1
            }
        ]
    };

    charts.marginSchedule = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: false },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'OGM ($K)' }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value);
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}
