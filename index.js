'use strict';

const {join} = require('path');
const {readFileSync} = require('fs');

const docinfoFunctions = require('./src/docinfo.js');
const css = readFileSync(join(__dirname, 'src', 'style.css')).toString();

const isInteractive = (type) => {
  return (block) => block.getAttribute('language', type) && block.isOption('interactive');
};

module.exports = function InteractiveRunnerExtension () {
  this.treeProcessor(function(){
    const self = this;

    self.process(function(doc){
      doc.findBy({ context: 'listing' }, isInteractive('javascript'))
        .forEach(block => {
          block.addRole('interactive interactive--javascript');
          block.setAttribute('runtime', 'runkit');

          if (block.isOption('endpoint')) {
            block.addRole('interactive--endpoint');
          }
        });
    });
  });

  this.docinfoProcessor(function(){
    this.process(function(doc){
      const blocks = doc.findBy({ context: 'listing' }, b => b.isAttribute('runtime', 'runkit'));

      if (blocks.length === 0 || doc.backend !== 'html5') {
        return '';
      }

      return `<style type="text/css">${css}</style>
<script src="https://embed.runkit.com/" defer async>
(function(d){
  const script = d.createElement('script');
  script.src = 'https://embed.runkit.com/';
  script.async = true;
  script.onload(function(){
    ${docinfoFunctions.map(f => f.toString()).join('\n')}
    installEvents();
    document.body.dataset.interactiveRuntime = 'loaded';
  });
})(document);</script>`;
    });
  });
};
