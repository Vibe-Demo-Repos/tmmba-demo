# Customer Segmentation Tool Demo

A React TypeScript application for retail businesses to segment customers using RFM (Recency, Frequency, Monetary) analysis. This tool helps businesses understand customer behavior patterns and generate targeted marketing strategies.

## Features

- Generate realistic retail customer data
- Segment customers using RFM analysis
- Visual dashboard with interactive charts
- Marketing insights with tailored recommendations
- Customer data explorer

## Prerequisites

Before you begin, you'll need to install the following tools:

### Node.js and npm

Node.js is a JavaScript runtime that allows you to run JavaScript code outside of a web browser. npm (Node Package Manager) comes bundled with Node.js.

**Installation:**

1. Visit the [Node.js download page](https://nodejs.org/en/download/)
2. Download the installer for your operating system
3. Run the installer and follow the installation wizard
4. Verify installation by opening a terminal/command prompt and typing:
   ```
   node --version
   npm --version
   ```

### Yarn

Yarn is a package manager that provides faster, more reliable dependency management than npm.

**Installation:**

1. With npm already installed, open a terminal/command prompt
2. Run the following command:
   ```
   npm install --global yarn
   ```
3. Verify installation:
   ```
   yarn --version
   ```

For more detailed installation instructions, visit the [Yarn Installation Guide](https://classic.yarnpkg.com/en/docs/install/).

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the repository

```bash
git clone https://github.com/Vibe-Demo-Repos/tmmba-demo.git
cd tmmba-demo
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Start the development server

```bash
yarn dev
```

This will start the development server at [http://localhost:5173](http://localhost:5173). Open this URL in your browser to view the application.

## Usage Guide

1. **Generate Sample Data**: Click the "Generate Sample Data" button to create randomized retail customer data.
2. **Run Segmentation**: Once data is generated, click "Run RFM Segmentation" to analyze and segment customers.
3. **Explore Tabs**:
   - **Visual Dashboard**: View scatter plots and pie charts of customer segments
   - **Marketing Insights**: Get tailored marketing recommendations for each segment
   - **Segment Analysis**: See detailed metrics for each customer segment
   - **Customer Data**: Explore individual customer records

## Building for Production

To create a production build:

```bash
yarn build
```

This creates a `dist` folder with optimized production files.

To preview the production build locally:

```bash
yarn preview
```

## Technologies Used

- React
- TypeScript
- Vite
- Recharts
- RFM Segmentation

## Project Structure

```
src/
├── components/
│   ├── data/          # Data generation components
│   ├── segmentation/  # RFM segmentation analysis
│   ├── visualization/ # Charts and dashboards
│   └── insights/      # Marketing recommendations
├── services/          # Business logic services
├── types/             # TypeScript type definitions
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is released under the MIT License.
