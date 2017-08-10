/* global window, document, Node, NodeList, $, fetch */
/* eslint-disable func-names, no-multi-assign, no-proto */
/* bling.js */
// Modified to make $ querySelector and $$ qSA
window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function (name, fn) {
  this.addEventListener(name, fn);
};
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach(elem => elem.on(name, fn));
};

const LegoPrice = (() => {
  const form = $('#set-form');
  const button = $('#submit');
  const setNumberInput = $('#set-number');

  const resultsSection = $('#results');
  const title = $('#title');
  const amazonLink = $('#amazon-link');
  const amazonPrice = $('#amazon-price');
  const walmartLink = $('#walmart-link');
  const walmartPrice = $('#walmart-price');
  const ebayLink = $('#ebay-link');
  const ebayPrice = $('#ebay-price');
  const ebaySales = $('#ebay-sales');

  const usd = value => `${Number(value)
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

  const reset = () => {
    resultsSection.classList.add('hidden');
    title.innerHTML = '';
    amazonLink.setAttribute('href', '#');
    amazonPrice.innerHTML = '';
    walmartLink.setAttribute('href', '#');
    walmartPrice.innerHTML = '';
    ebayLink.setAttribute('href', '#');
    ebayPrice.innerHTML = '';
    ebaySales.innerHTML = '';
  };

  const fillResults = (results) => {
    console.log('fillResults', results);
    title.innerHTML = results.amazon.title;
    amazonLink.setAttribute('href', results.amazon.url);
    amazonPrice.innerHTML = usd(results.amazon.price);
    walmartLink.setAttribute('href', results.walmart.url);
    walmartPrice.innerHTML = usd(results.walmart.price);
    ebayLink.setAttribute('href', results.ebay.active.url);
    ebayPrice.innerHTML = usd(results.ebay.active.price);
    let sales = '';
    results.ebay.completed.forEach((sale) => {
      sales += `${usd(sale)} `;
    });
    ebaySales.innerHTML = sales;
  };

  const search = (event) => {
    event.preventDefault();
    reset();
    button.classList.add('is-loading');
    const setNumber = setNumberInput.value;
    fetch(`/api/set/${setNumber}`)
      .then(res => res.json())
      .then((res) => {
        button.classList.remove('is-loading');
        resultsSection.classList.remove('hidden');
        fillResults(res);
      })
      .catch(err => console.error(err));
  };

  return {
    init: () => {
      // Add search event listeners
      form.on('submit', search);
      button.on('click', search);
    },
  };
})();

(() => {
  LegoPrice.init();
})();
