import React, { useEffect } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Services from './components/Services';
import DemoForm from './components/DemoForm';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ESGReportForm from './components/ESGReportForm';
import BRSRPage from './components/BRSRPage';
import FinalReportPage from './components/FinalReportPage';
import CompaniesPage from './components/CompaniesPage';
import { isAuthenticated } from './utils/auth';
import './assets/styles.css';

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      isAuthenticated()
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location.pathname } }} />
    )}
  />
);

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTopOnRouteChange />
        <Header />
        <main className="app-main" id="main-content">
          <Switch>
            <Route path="/" exact component={HomePage} />
            <Route path="/services" component={Services} />
            <Route path="/companies" component={CompaniesPage} />
            <Route path="/demo" component={DemoForm} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <ProtectedRoute path="/profile" component={ProfilePage} />
            <ProtectedRoute path="/esg-report" component={ESGReportForm} />
            <ProtectedRoute path="/brsr" component={BRSRPage} />
            <ProtectedRoute path="/final-report" component={FinalReportPage} />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
