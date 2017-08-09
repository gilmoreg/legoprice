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

  const search = (event) => {
    event.preventDefault();
    button.classList.add('is-loading');
    const setNumber = setNumberInput.value;
    fetch(`/api/set/${setNumber}`)
      .then(res => res.json())
      .then((res) => {
        button.classList.remove('is-loading');
        console.log(res);
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
