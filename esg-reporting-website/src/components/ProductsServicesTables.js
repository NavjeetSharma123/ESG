import React from 'react';
import { createProductsServicesAnswer, normalizeProductsServicesAnswer } from '../utils/brsrProductsServices';
import './ProductsServicesTables.css';

const ProductsServicesTables = ({ value, onChange, readOnly = false }) => {
  const answer = normalizeProductsServicesAnswer(value || createProductsServicesAnswer());
  const updateCell = (table, rowIndex, field, nextValue) => {
    if (readOnly) return;
    const next = normalizeProductsServicesAnswer(answer);
    next[table][rowIndex][field] = nextValue;
    onChange(next);
  };
  const input = (table, rowIndex, field, placeholder) => (
    readOnly ? <span>{answer[table][rowIndex][field] || '—'}</span> : <input value={answer[table][rowIndex][field]} onChange={(event) => updateCell(table, rowIndex, field, event.target.value)} placeholder={placeholder} />
  );

  return <div className={`products-services-tables ${readOnly ? 'is-read-only' : ''}`}>
    <section><h3>Products/Services</h3><div className="products-services-tables__scroll"><table><thead><tr><th>S. No.</th><th>Product/Service</th><th>NIC Code</th><th>% of total Turnover contributed</th></tr></thead><tbody>{answer.productServices.map((row, index) => <tr key={index}><td>{index + 1}</td><td>{input('productServices', index, 'productService', 'Product or service')}</td><td>{input('productServices', index, 'nicCode', 'NIC code')}</td><td>{input('productServices', index, 'turnoverPercent', 'Percentage')}</td></tr>)}</tbody></table></div></section>
    <section><h3>Business activities</h3><div className="products-services-tables__scroll"><table><thead><tr><th>S. No.</th><th>Description of Main Activity</th><th>Description of Business Activity</th><th>% of Turnover of the entity</th></tr></thead><tbody>{answer.businessActivities.map((row, index) => <tr key={index}><td>{index + 1}</td><td>{input('businessActivities', index, 'mainActivity', 'Main activity')}</td><td>{input('businessActivities', index, 'businessActivity', 'Business activity')}</td><td>{input('businessActivities', index, 'turnoverPercent', 'Percentage')}</td></tr>)}</tbody></table></div></section>
  </div>;
};

export default ProductsServicesTables;
