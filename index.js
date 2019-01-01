'use strict';

const {join} = require('path');
const {readFileSync} = require('fs');

const docinfoFunctions = require('./src/docinfo.js');
const css = readFileSync(join(__dirname, 'src', 'style.css')).toString();

// The default version of the runner is based on the version of Node running this code
const DEFAULT_NODE_VERSION = process.version.split('.').shift();

const isInteractive = (type) => {
  return (block) => block.isAttribute('language', type) && block.isOption('interactive');
};

module.exports = function InteractiveRunnerExtension () {
  this.treeProcessor(function(){
    const self = this;

    self.process(function(doc){
      doc.findBy({ context: 'listing' }, isInteractive('javascript'))
        .forEach(block => {
          const nodeVersion = doc.getAttribute('runner-node') || DEFAULT_NODE_VERSION;
          
          block.addRole('interactive');
          block.addRole('interactive--javascript');
          block.addRole(`interactive--runtime--node-${nodeVersion}`);
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

      return `<style type="text/css" class="extension-interactive-runner">${css}</style>
<script class="extension-interactive-runner">
(function(d){
  document.addEventListener('DOMContentLoaded', function(){
    const script = d.createElement('script');
    script.src = 'https://embed.runkit.com/';
    script.async = true;
    script.onload = function(){
      ${docinfoFunctions.map(f => f.toString()).join('\n')}
      installEvents();
      document.body.dataset.interactiveRuntime = 'loaded';
    };
    document.body.appendChild(script);
  });
})(document);</script>`;
    });
  });
};
