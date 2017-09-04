'use strict';

module.exports = function InteractiveRunnerExtension () {
  const convert = function convertListingToRunkitEmbed (el){
    const source = el.textContent;
    const element = el.parentNode.parentNode;
    element.innerHTML = '';

    // eslint-disable-next-line no-undef
    RunKit.createNotebook({ element, source })
  };

  this.treeProcessor(function(){
    var self = this;

    self.process(function(doc){
      const blocks = doc.findBy({ context:'listing' }, b => b.getAttribute('language') === 'javascript' && b.isOption('interactive'));

      if (blocks.length) {
        blocks.forEach(block => {
          block.addRole('interactive');
          block.setAttribute('runtime', 'runkit');
        });
      }
    })
  });

  this.postprocessor(function(){
    var self = this;

    self.process(function(doc, output){
      if (doc.backend !== 'html5') {
        return output;
      }

      const blocks = doc.findBy({ context: 'listing'}, b => b.getAttribute('runtime') === 'runkit');

      if (blocks.length) {
        output = output.replace(/(class="listingblock interactive">)([^\/]+)(<code class="language-javascript")/g, (m, klass, pre, code) => {
          return klass + pre + code + ' onclick="javascript:convertListingToRunkitEmbed(this)"';
        });

        output += '<script type="text/javascript" src="https://embed.runkit.com/" defer async></script>';

        output += `<script type="text/javascript">${convert.toString()}</script>`;
      }

      return output;
    });
  });
};
