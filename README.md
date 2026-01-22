# PS Beacon Big Deal Margin Dashboard

A comprehensive web-based dashboard for tracking and managing priority deals in HP Personal Systems (PS) to enable proactive margin management and recovery actions.

## Overview

This dashboard implements all design requirements from the "PS Beacon Big Deal Margin Dashboard Design Requirements" document (v0.2, January 2025). It provides visibility into forecasted and secured performance for priority deals across global market clusters.

## Features

### 1. Overview Dashboard
- **Key Performance Indicators (KPIs)**
  - Total Priority Deals count
  - Expected End-of-Quarter Revenue
  - Expected End-of-Quarter OGM (Operating Gross Margin)
  - At-Risk Deals count

- **Visualizations**
  - Margin Performance by Cluster (bar chart)
  - Secured vs Forecast Attainment (doughnut chart)

- **Priority Deals Table**
  - Comprehensive deal listing with key metrics
  - Filterable by cluster
  - Status indicators (On Track, Watch, At Risk)
  - Variance tracking vs plan

### 2. Cluster View
- Regional grouping (EMEA, APJ, AMS)
- Individual cluster cards showing:
  - Deal count
  - Total revenue
  - Expected OGM and OGM %
  - Variance vs plan
  - At-risk deal indicators

### 3. Deal Details View
- Customer and deal information
- Deal summary metrics (forecast, secured, total revenue, OGM)
- SKU-level breakdown table showing:
  - SKU details (category, series, model)
  - Forecast and secured units
  - Pricing and revenue
  - Margin percentages

### 4. Forecast vs Actual View
- Weekly schedule visualizations (13-week quarter)
- Three time-series charts:
  - Volume Schedule (units)
  - Revenue Schedule
  - Margin Schedule (OGM)
- Comparison of Actual, Secured, and Forecast data

## Design Requirements Coverage

This dashboard addresses all 8 design requirements (DR-1 through DR-8):

- **DR-1**: Customer/Deal Performance Actuals - Shipment-based profitability metrics
- **DR-2**: Order Backlog - Secured attainment integration
- **DR-3**: Customer/Deal Performance Forecast - Dynamics forecast integration
- **DR-4**: Expected Margin Position & Delta - Derived expected EoQ OGM with variance
- **DR-5**: OGM Validation - Full OGM-level visibility with operational adjustments
- **DR-6**: Time-Series Visibility - Weekly, monthly, quarterly views
- **DR-7**: Cluster-Level Visibility - Market cluster segmentation
- **DR-8**: Customer Selection - ~25 deals per cluster with filtering capability

## Technical Implementation

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Interactive functionality
- **Chart.js 4.4.1**: Data visualizations

### File Structure
```
├── index.html          # Main dashboard HTML
├── styles.css          # Styling and responsive design
├── data.js            # Data model and sample data generation
├── dashboard.js       # Dashboard functionality and chart rendering
└── README.md          # This file
```

## Getting Started

### Opening the Dashboard

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. No server or build process required - runs entirely in the browser

### Sample Data

The dashboard currently uses **generated sample data** that demonstrates all features and requirements:
- 90+ deals across 22 market clusters
- Realistic revenue and margin figures
- Weekly schedules with forecast and secured data
- SKU-level detail for each deal

### Connecting to Real Data

To integrate with actual data sources (DPT, TERA, Dynamics):

1. **Modify `data.js`**:
   - Replace the `generateDealsData()` function with API calls to your data sources
   - Map the API responses to the expected data structure

2. **Required Data Structure**:
```javascript
{
  dealId: string,
  customer: string,
  cluster: string,
  region: string,
  forecastRevenue: number,
  securedRevenue: number,
  expectedOGM: number,
  ogmPercent: number,
  variancePercent: number,
  status: string,
  skus: [
    {
      skuId: string,
      category: string,
      forecastUnits: number,
      securedUnits: number,
      price: number,
      cost: number,
      weeklySchedule: [...]
    }
  ]
}
```

3. **Update Refresh Logic**:
   - Add periodic data refresh in `dashboard.js`
   - Implement error handling for API failures
   - Add loading indicators during data fetch

## Market Clusters

The dashboard includes all clusters specified in the requirements:

### EMEA
- CEE (Central & Eastern Europe)
- DACH
- ECDA
- EET&I
- Switzerland
- NWE (North-West Europe)
- Nordics
- UK&I
- SEA (South Europe Area)
- France
- Italy
- MEA

### APJ
- GAJ (Greater Asia Japan)
- Korea
- ANZ (Australia & New Zealand)
- Southeast Asia
- GCG (Greater China Group)
- India

### AMS
- North America
- Canada
- Brazil
- Mexico
- MCA (Mexico & Central America)

## Browser Compatibility

Tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1920x1080 and above)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## Future Enhancements

Potential improvements for production deployment:

1. **Data Integration**
   - Connect to DPT/TERA Deal Profitability API
   - Integrate Dynamics/SPR forecast data
   - Implement TERA Orders backlog feed
   - Add PriceHub and iCost integration

2. **Advanced Features**
   - User authentication and role-based access
   - Export functionality (Excel, PDF)
   - Drill-down capabilities
   - Custom date range selection
   - Deal comparison tool
   - Alert notifications for at-risk deals

3. **Performance Optimization**
   - Data caching and pagination
   - Virtual scrolling for large datasets
   - Lazy loading of charts
   - Service worker for offline capability

4. **Analytics**
   - Trend analysis and predictions
   - What-if scenario modeling
   - Historical comparison views
   - Custom report builder

## Support and Maintenance

For questions or issues:
1. Review this documentation
2. Check browser console for errors
3. Verify data structure matches expected format
4. Ensure Chart.js library is loading correctly

## Version History

- **v1.0** (January 2025): Initial release with all core features
  - Overview dashboard with KPIs
  - Cluster view
  - Deal details with SKU breakdown
  - Forecast vs Actual time-series visualizations
  - Sample data generation
  - Responsive design

## License

Internal HP tool - All rights reserved.
