'use strict';

function makeListingInteractive (element){
  if (element.classList.contains('interactive--installed') || element.classList.contains('status--loading')) {
    return;
  }

  const code = element.querySelector('code');
  const isEndpoint = element.classList.contains('interactive--endpoint');
  const mode = isEndpoint ? 'endpoint' : null;
  const source = code
    .textContent
    .replace(/\(\d+\)$/gm, '')
    .replace(/^["']?use strict["'][; ]*\n/, '');
  const extraSource = isEndpoint
    ? '\n\nexports.endpoint = server.listeners("request").pop();'
    : '';

  element.classList.add('status--loading');

  // eslint-disable-next-line no-undef
  RunKit.createNotebook({
    element: element,
    source: source + extraSource,
    mode: mode,
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
    if (el.target.classList.contains('language-javascript')) {
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
