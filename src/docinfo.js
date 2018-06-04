'use strict';

function makeListingInteractive (element){
  if (element.classList.contains('interactive--installed') || element.classList.contains('status--loading')) {
    return;
  }

  const code = element.querySelector('code');
  const nodeVersion = /interactive--runtime--node-([^\s]+)/.exec(element.className)[1];
  const isEndpoint = element.classList.contains('interactive--endpoint');
  const mode = isEndpoint ? 'endpoint' : null;
  let preamble = '';

  const source = code
    .textContent
    .replace(/\(\d+\)$/gm, '')
    .replace(/^["']?use strict["'][; ]*\n/, '');

  if (isEndpoint) {
    preamble = `process.nextTick(() => {
      if (typeof module.exports === 'function') {
        exports.endpoint = module.exports;
      }
      else if (typeof server !== 'undefined') {
        exports.endpoint = server.listeners("request").pop();
      }
});`
  }

  element.classList.add('status--loading');

  // eslint-disable-next-line no-undef
  RunKit.createNotebook({
    nodeVersion,
    element,
    source,
    mode,
    preamble,
    onLoad: function(ntbk) {
      element.classList.add('interactive--installed');
      element.classList.remove('status--loading');
      element.classList.add('status--loaded');
      code.parentNode.setAttribute('hidden', true);

      ntbk.evaluate();
    }
  });
}

function installEvents () {
  function getParent(el, condition) {
    let parent = el;

    while(parent = parent.parentNode) {
      if (condition(parent)) {
        return parent;
      }
    }
  }

  function hasClass(className) {
    return function check(el) {
      return el.classList.contains(className);
    }
  }

  document.querySelector('body').addEventListener('click', function(el) {
    if (el.target.classList.contains('language-javascript') || el.target.classList.contains('language-js')) {
      const parentNode = getParent(
        el.target,
        hasClass('interactive--javascript')
      );

      makeListingInteractive(parentNode);
    }
  });
}

module.exports = [
  makeListingInteractive,
  installEvents,
];
