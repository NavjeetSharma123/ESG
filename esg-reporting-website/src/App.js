import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Services from './components/Services';
import DemoForm from './components/DemoForm';
import ESGReportForm from './components/ESGReportForm';
import GRIDetailsForm from './components/GRIDetailsForm';
import BRSRPage from './components/BRSRPage';
import FinalReportPage from './components/FinalReportPage';
import ESGReportResult from './components/ESGReportResult';
import CompaniesPage from './components/CompaniesPage';
import MSCIReadiness from './components/MSCIReadiness';
import './assets/styles.css';

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTopOnRouteChange />
        <Header />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/services" component={Services} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/demo" component={DemoForm} />
          <Route path="/esg-report" component={ESGReportForm} />
          <Route path="/gri-details" component={GRIDetailsForm} />
          <Route path="/brsr" component={BRSRPage} />
          <Route path="/msci-readiness" component={MSCIReadiness} />
          <Route path="/final-report" component={FinalReportPage} />
          <Route path="/esg-report-result" component={ESGReportResult} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;