import '@babel/polyfill';
import TurndownService from 'turndown';
import query from 'query-string';

import Mercury from '@frontender-magazine/mercury-sdk';

require('dotenv').config({path: '../.env'});
const turndownPluginGfm = require('turndown-plugin-gfm');

import pager from './__mock__/page.js';

export default class ArticleBuilder {
  
  async getArticle(url) {
    const parser = new Mercury(process.env.MERCURY_KEY);
    return [pager];
    // return parser.getAll(url);
  }
  
  convertToMD(page) {
    const turndownService = new TurndownService();
    
    turndownService.addRule('codepenScript', {
      filter:  function (node, options) {
        return (node.nodeName == 'P')&&(node.classList.contains('codepen'));
      },
      replacement: function (content, node, options) {
        const data = {};
        if(node.getAttribute('data-theme-id')) data['theme-id'] = node.getAttribute('data-theme-id');
        if(node.getAttribute('data-slug-hash')) data['slug-hash'] = node.getAttribute('data-slug-hash');
        if(node.getAttribute('data-default-tab')) data['default-tab'] = node.getAttribute('data-default-tab');
        if(node.getAttribute('data-user')) data['user'] = node.getAttribute('data-user');
        if(node.getAttribute('data-embed-version')) data['embed-version'] = node.getAttribute('data-embed-version');
        if(node.getAttribute('data-pen-title')) data['pen-title'] = node.getAttribute('data-pen-title');
        
        const link = node.querySelector('a');
        const src = (link !== null) ? link.getAttribute('href').replace(/http(s)?:/i,'') : `//codepen.io/${data.user}/pen/${data['slug-hash']}/`;
        let search = query.stringify(data);
        
        if (search.length > 0) search = `?${search}`;
        
        console.log(`
          
          [codepen=${src}${search}]
          
        `);
        return `\n\n[codepen=${src}${search}]\n\n`;
      }
    });
    
    turndownService.use(turndownPluginGfm.gfm);
    let markdown = turndownService.turndown(page);
    
    let index = 0;
    let sources = '';
    markdown = markdown.replace(/!\[([^\]]*)\]\(([^\)]*)\)/igm, (match, alt, source, offset, string)=>{
      index++;
      sources = `${sources}\n[image-${index}]: ${source}`;
      return `!◐${alt}◑(image-${index})`;
    });
    
    markdown = `${markdown}\n\n${sources}`;
    
    index = 0;
    sources = '';
    markdown = markdown.replace(/[^!]\[([^\]]*)\]\(([^\)]*)\)/igm, (match, alt, source, offset, string)=>{
      index++;
      sources = `${sources}\n[${index}]: ${source}`;
      return `[${alt}](${index})`;
    });
    
    markdown = markdown.replace(/◐/igm,'[').replace(/◑/igm,']');
    
    return `${markdown}\n\n${sources}`;
  }
  
  async create(url, slug=null, author=null) {
    const pages = await this.getArticle(url);
    const content = pages.map(page => (page.content)).reduce((accumulator, page) => (`${accumulator}${page}`));
    const markdown = this.convertToMD(content);
    return markdown;
  }
}

(async () => {
  const builder = new ArticleBuilder();
  const result = await builder.create('https://alistapart.com/article/practical-grid');
  console.log(result);
})();