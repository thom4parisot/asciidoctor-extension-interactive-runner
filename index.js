'use strict';

module.exports = function InteractiveRunnerExtension () {
  const convert = function convertListingToRunkitEmbed (element){
    const code = element.querySelector('code')

    const source = code
      .textContent
      .replace(/^["']?use strict["'][; ]*\n/, '');

    code.classList.add('status--loading');

    // eslint-disable-next-line no-undef
    RunKit.createNotebook({
      element: element,
      source: source,
      onLoad: function(ntbk) {
        code.classList.remove('status--loading');
        code.classList.add('status--loaded');
        code.parentNode.setAttribute('hidden', true);
      }
    });
  };

  this.treeProcessor(function(){
    var self = this;

    self.process(function(doc){
      const blocks = doc.findBy({ context:'listing' }, b => b.getAttribute('language') === 'javascript' && b.isOption('interactive'));

      if (blocks.length) {
        blocks.forEach(block => {
          block.addRole('interactive interactive--javascript');
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
        output = output.replace(/( class="listingblock interactive interactive--javascript">)/g, (m, klass) => {
          return ' onclick="javascript:convertListingToRunkitEmbed(this)"' + klass ;
        });

        output = output.replace(/(<\/body>|$)/, `<script type="text/javascript" src="https://embed.runkit.com/" defer async></script>
        <script type="text/javascript">${convert.toString()}</script>\$1`);
      }

      return output;
    });
  });
};
