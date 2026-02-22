import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Services from './components/Services';
import DemoForm from './components/DemoForm';
import ESGReportForm from './components/ESGReportForm';
import ESGReportResult from './components/ESGReportResult';
import './assets/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/services" component={Services} />
          <Route path="/demo" component={DemoForm} />
          <Route path="/esg-report" component={ESGReportForm} />
          <Route path="/esg-report-result" component={ESGReportResult} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;