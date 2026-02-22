import React, { useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import './ESGReportResult.css';

const ESGReportResult = () => {
  const history = useHistory();
  const location = useLocation();
  const { reportUrl, companyName } = location.state || {};

  useEffect(() => {
    if (reportUrl) {
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `ESG_Report_${(companyName || 'Company').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(reportUrl);
      history.replace('/esg-report-result', {});
    }
  }, [reportUrl, companyName, history]);

  return (
    <div className="esg-report-result">
      <div className="result-card">
        <span className="result-icon">✓</span>
        <h1>Report Generated Successfully</h1>
        <p>
          {reportUrl
            ? "Your ESG report has been generated and the download should start automatically. If it didn't start, check your browser's download folder."
            : 'Your report was downloaded. Generate another or return home.'}
        </p>
        <div className="result-actions">
          <Link to="/esg-report" className="btn btn-primary">
            Generate Another Report
          </Link>
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ESGReportResult;
