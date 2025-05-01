import { useState } from "react";
import "./App.css";
import DataGenerator from "./components/data/DataGenerator";
import CustomerSegmentation from "./components/segmentation/CustomerSegmentation";
import { Customer } from "./types/CustomerTypes";

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Customer Segmentation Tool</h1>
          <p className="subtitle">Retail Business Intelligence Dashboard</p>
        </div>
      </header>
      <main className="app-content">
        <section className="app-section">
          <h2 className="section-title">Customer Data Generator</h2>
          <p className="section-description">
            Generate realistic retail customer data for segmentation analysis.
          </p>
          <DataGenerator onDataGenerated={setCustomers} />
        </section>

        {customers.length > 0 && (
          <section className="app-section">
            <h2 className="section-title">Customer Segmentation Analysis</h2>
            <p className="section-description">
              Segment customers based on RFM (Recency, Frequency, Monetary)
              analysis.
            </p>
            <CustomerSegmentation customers={customers} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
