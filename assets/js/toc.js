// renders table-of-contents for the given page
// alternative to https://github.com/dafi/jekyll-toc-generator or https://github.com/dafi/tocmd-generator
if(typeof document.querySelectorAll === 'function') {
    var toc = document.querySelectorAll('[id^=toc]'),
        len = toc.length,
        df = document.createDocumentFragment(),
        sidebar = document.querySelector('aside'), 
        main_header = document.querySelector('article > h1'), 
        h4, ul, li, anchor, i;
    
    if(len > 0) {
        ul = document.createElement('ul');
        for(i = 0; i < len; i++) {
            // restrict to h1,h2,h3
            if(toc[i].nodeName == 'H1' || toc[i].nodeName == 'H2' || toc[i].nodeName == 'H3') {
                li = document.createElement('li'); 
                anchor = document.createElement('a');
                anchor.href = '#' + toc[i].id;
                anchor.innerText = toc[i].innerText;
                anchor.title = 'Jump to ' + toc[i].innerText;
                li.appendChild(anchor);
                ul.appendChild(li);
            }
        }
        h4 = document.createElement('h4');
        h4.innerText = "On this page";
        df.appendChild(h4);
        df.appendChild(ul);
        
        sidebar.insertBefore(df, sidebar.firstChild);
    }
    
}
