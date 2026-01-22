// Market Clusters based on requirements
const clusters = {
    'CEE': { region: 'EMEA', name: 'Central & Eastern Europe', markets: ['Poland', 'Czech Republic', 'Hungary'] },
    'DACH': { region: 'EMEA', name: 'DACH', markets: ['Germany', 'Austria'] },
    'ECDA': { region: 'EMEA', name: 'ECDA', markets: ['Denmark', 'Finland', 'Sweden'] },
    'EET&I': { region: 'EMEA', name: 'EET&I', markets: ['Turkey', 'Israel'] },
    'Switzerland': { region: 'EMEA', name: 'Switzerland', markets: ['Switzerland'] },
    'NWE': { region: 'EMEA', name: 'North-West Europe', markets: ['Netherlands', 'Belgium'] },
    'Nordics': { region: 'EMEA', name: 'Nordics', markets: ['Norway', 'Sweden', 'Denmark'] },
    'UK&I': { region: 'EMEA', name: 'UK & Ireland', markets: ['UK', 'Ireland'] },
    'SEA': { region: 'EMEA', name: 'South Europe Area', markets: ['Spain', 'Portugal', 'Greece'] },
    'France': { region: 'EMEA', name: 'France', markets: ['France'] },
    'Italy': { region: 'EMEA', name: 'Italy', markets: ['Italy'] },
    'GAJ': { region: 'APJ', name: 'Greater Asia Japan', markets: ['Japan'] },
    'Korea': { region: 'APJ', name: 'Korea', markets: ['South Korea'] },
    'ANZ': { region: 'APJ', name: 'Australia & New Zealand', markets: ['Australia', 'New Zealand'] },
    'SEAsia': { region: 'APJ', name: 'Southeast Asia', markets: ['Singapore', 'Thailand', 'Malaysia'] },
    'GCG': { region: 'APJ', name: 'Greater China Group', markets: ['China', 'Hong Kong', 'Taiwan'] },
    'India': { region: 'APJ', name: 'India', markets: ['India'] },
    'NA': { region: 'AMS', name: 'North America', markets: ['United States'] },
    'Canada': { region: 'AMS', name: 'Canada', markets: ['Canada'] },
    'Brazil': { region: 'AMS', name: 'Brazil', markets: ['Brazil'] },
    'Mexico': { region: 'AMS', name: 'Mexico', markets: ['Mexico'] },
    'MCA': { region: 'AMS', name: 'Mexico & Central America', markets: ['Mexico', 'Costa Rica'] }
};

// Sample SKU data
const skuTypes = [
    { category: 'Notebook', series: 'EliteBook', model: '840 G10', avgPrice: 1200, avgCost: 850 },
    { category: 'Notebook', series: 'ProBook', model: '450 G9', avgPrice: 800, avgCost: 600 },
    { category: 'Desktop', series: 'EliteDesk', model: '800 G9', avgPrice: 950, avgCost: 700 },
    { category: 'Desktop', series: 'ProDesk', model: '400 G9', avgPrice: 650, avgCost: 500 },
    { category: 'Workstation', series: 'Z Book', model: 'Studio G10', avgPrice: 2500, avgCost: 1800 },
    { category: 'Monitor', series: 'E-Series', model: 'E27', avgPrice: 300, avgCost: 220 },
    { category: 'Accessories', series: 'Docking', model: 'USB-C G5', avgPrice: 180, avgCost: 130 }
];

// Generate sample deals data
function generateDealsData() {
    const customers = [
        'Accenture', 'Deloitte', 'PwC', 'KPMG', 'EY', 'IBM', 'Capgemini', 'TCS',
        'Cognizant', 'Infosys', 'DXC Technology', 'Atos', 'NTT Data', 'Wipro',
        'HCL Technologies', 'Tech Mahindra', 'CGI Group', 'Fujitsu', 'Orange Business',
        'BT Group', 'Deutsche Bank', 'HSBC', 'JPMorgan', 'Goldman Sachs', 'Citigroup',
        'Bank of America', 'Wells Fargo', 'Morgan Stanley', 'UBS', 'Credit Suisse'
    ];

    const deals = [];
    let dealId = 1000;

    Object.keys(clusters).forEach(clusterKey => {
        // Generate 3-5 deals per cluster
        const numDeals = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numDeals; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const dealIdStr = `DL-${dealId++}`;

            // Generate SKU mix for this deal
            const numSkus = Math.floor(Math.random() * 4) + 2;
            const skus = [];
            let totalForecastRevenue = 0;
            let totalSecuredRevenue = 0;
            let totalForecastCost = 0;
            let totalSecuredCost = 0;

            for (let s = 0; s < numSkus; s++) {
                const skuType = skuTypes[Math.floor(Math.random() * skuTypes.length)];
                const forecastUnits = Math.floor(Math.random() * 2000) + 500;
                const securedUnits = Math.floor(forecastUnits * (0.3 + Math.random() * 0.5)); // 30-80% secured

                // Add some price variance
                const priceVariance = 0.9 + Math.random() * 0.2; // 90-110% of avg price
                const actualPrice = skuType.avgPrice * priceVariance;
                const actualCost = skuType.avgCost * priceVariance;

                const skuForecastRev = forecastUnits * actualPrice;
                const skuSecuredRev = securedUnits * actualPrice;
                const skuForecastCost = forecastUnits * actualCost;
                const skuSecuredCost = securedUnits * actualCost;

                totalForecastRevenue += skuForecastRev;
                totalSecuredRevenue += skuSecuredRev;
                totalForecastCost += skuForecastCost;
                totalSecuredCost += skuSecuredCost;

                // Generate weekly schedule for Q1 (13 weeks)
                const weeklySchedule = generateWeeklySchedule(forecastUnits, securedUnits);

                skus.push({
                    skuId: `SKU-${skuType.category.substring(0,2).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
                    category: skuType.category,
                    series: skuType.series,
                    model: skuType.model,
                    forecastUnits,
                    securedUnits,
                    price: actualPrice,
                    cost: actualCost,
                    forecastRevenue: skuForecastRev,
                    securedRevenue: skuSecuredRev,
                    forecastCost: skuForecastCost,
                    securedCost: skuSecuredCost,
                    weeklySchedule
                });
            }

            // Calculate margins
            const forecastOGM = totalForecastRevenue - totalForecastCost;
            const securedOGM = totalSecuredRevenue - totalSecuredCost;
            const expectedOGM = forecastOGM + securedOGM;
            const ogmPercent = (expectedOGM / (totalForecastRevenue + totalSecuredRevenue)) * 100;

            // Calculate planned OGM (with some variance)
            const plannedOGMPercent = 15 + Math.random() * 10; // 15-25%
            const plannedOGM = (totalForecastRevenue + totalSecuredRevenue) * (plannedOGMPercent / 100);
            const variancePercent = ((expectedOGM - plannedOGM) / plannedOGM) * 100;

            deals.push({
                dealId: dealIdStr,
                customer,
                cluster: clusterKey,
                region: clusters[clusterKey].region,
                forecastRevenue: totalForecastRevenue,
                securedRevenue: totalSecuredRevenue,
                totalRevenue: totalForecastRevenue + totalSecuredRevenue,
                forecastOGM,
                securedOGM,
                expectedOGM,
                ogmPercent,
                plannedOGM,
                variancePercent,
                varianceAmount: expectedOGM - plannedOGM,
                status: Math.abs(variancePercent) > 10 ? 'At Risk' : variancePercent < -5 ? 'Watch' : 'On Track',
                skus,
                lastUpdated: new Date().toISOString()
            });
        }
    });

    return deals;
}

// Generate weekly schedule (13 weeks for Q1)
function generateWeeklySchedule(totalForecast, totalSecured) {
    const weeks = 13;
    const schedule = [];

    // Generate forecast distribution (bell curve-ish)
    let remainingForecast = totalForecast;
    let remainingSecured = totalSecured;

    for (let w = 0; w < weeks; w++) {
        const weekNum = w + 1;

        // More volume in middle weeks
        const weight = Math.sin((w / weeks) * Math.PI);
        const forecastUnits = w === weeks - 1 ? remainingForecast : Math.floor((totalForecast / weeks) * weight * 1.5);
        const securedUnits = w === weeks - 1 ? remainingSecured : Math.floor((totalSecured / weeks) * weight * 1.5);

        remainingForecast -= forecastUnits;
        remainingSecured -= securedUnits;

        schedule.push({
            week: weekNum,
            forecastUnits: Math.max(0, forecastUnits),
            securedUnits: Math.max(0, securedUnits),
            actualUnits: w < 6 ? Math.floor(securedUnits * 0.9) : 0 // Actuals only for past weeks
        });
    }

    return schedule;
}

// Generate the data
const dealsData = generateDealsData();

// Calculate summary statistics
const summaryStats = {
    totalDeals: dealsData.length,
    totalRevenue: dealsData.reduce((sum, d) => sum + d.totalRevenue, 0),
    totalOGM: dealsData.reduce((sum, d) => sum + d.expectedOGM, 0),
    atRiskDeals: dealsData.filter(d => d.status === 'At Risk').length,
    avgOGMPercent: dealsData.reduce((sum, d) => sum + d.ogmPercent, 0) / dealsData.length,
    totalVariance: dealsData.reduce((sum, d) => sum + d.varianceAmount, 0)
};

// Calculate cluster rollups
const clusterStats = {};
Object.keys(clusters).forEach(clusterKey => {
    const clusterDeals = dealsData.filter(d => d.cluster === clusterKey);
    if (clusterDeals.length > 0) {
        clusterStats[clusterKey] = {
            name: clusters[clusterKey].name,
            region: clusters[clusterKey].region,
            dealCount: clusterDeals.length,
            totalRevenue: clusterDeals.reduce((sum, d) => sum + d.totalRevenue, 0),
            totalOGM: clusterDeals.reduce((sum, d) => sum + d.expectedOGM, 0),
            avgOGMPercent: clusterDeals.reduce((sum, d) => sum + d.ogmPercent, 0) / clusterDeals.length,
            atRiskCount: clusterDeals.filter(d => d.status === 'At Risk').length,
            variance: clusterDeals.reduce((sum, d) => sum + d.varianceAmount, 0)
        };
    }
});

// Export data
window.dashboardData = {
    deals: dealsData,
    clusters,
    clusterStats,
    summaryStats,
    lastUpdated: new Date()
};
