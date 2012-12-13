/*

<a href="javascript:(function(){if(window.namicsResponsiveDebugBookmarklet!==undefined){namicsResponsiveDebugBookmarklet();}else{document.body.appendChild(document.createElement('script')).src='http://namics.github.com/ResponsiveDebugBookmarklet/js/responsive-debug-bookmarklet.js';}})();">Namics Responsive Debug Bookmarklet</a>

References
------------
Bookmarklet Structure:
http://coding.smashingmagazine.com/2010/05/23/make-your-own-bookmarklets-with-jquery/

jquery-total-storage:
https://github.com/jarednova/jquery-total-storage

Breakpoint CSS:
http://bueltge.de/test/media-query-debugger.php
*/
var baseurl = 'http://namics.github.com/ResponsiveDebugBookmarklet'
var scripturl = baseurl + '/js/responsive-debug-bookmarklet.js';
var styleurl = baseurl + '/css/style.css';


(function(){
    var v = "1.7";
    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        var done = false;
        var script = document.createElement("script");
            script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
            script.onload = script.onreadystatechange = function(){
                if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
                    done = true;
                    initNamicsResponsiveDebugBookmarklet();
                }
            };
            document.getElementsByTagName("head")[0].appendChild(script);
        } else {
            initNamicsResponsiveDebugBookmarklet();
        }
         
        function initNamicsResponsiveDebugBookmarklet() {
            (window.namicsResponsiveDebugBookmarklet = function() {
                /* remove already if existing */
                $(window).off('resize');
                $('#namics-responsive-debug').remove();
                /* load totalStorage-plugin */
               if($.totalStorage == undefined){
                   document.body.appendChild(document.createElement('script')).src = baseurl + '/js/jquery.total-storage.min.js';
               }
               var nrdcontainer = $('<div id="namics-responsive-debug" />');
               var topbar = $('<div class="namics-responsive-debug-elem nrd-topbar" />');
               nrdcontainer.append(topbar);
               var toolbutton = $('<div class="namics-responsive-debug-elem nrd-toolbutton">Toogle picturesize</div>')
               nrdcontainer.append(toolbutton)
               var imagesizecontainer = $('<div />');
               nrdcontainer.append(imagesizecontainer);
               var imgsizetimer;
               var showimagesize = true;
            
               function init() {
                   /* wait till totalStorage-plugin is loaded */
                   try {
                       $.totalStorage('test', 'toll');
                   } catch(e) {
                       setTimeout(init,500);
                       return false;
                   }
                   $('head').append($('<link href="' + styleurl + '" rel="stylesheet" />'));
                   $('body').append(nrdcontainer);
                   setWindowSize();
                   showWindowSizeOnResize();
                   showImageSize();
                   initCloseListener();
                   toggleImageSize();
               }
            
               function initCloseListener() {
                   topbar.on('click', function(){
                       $(window).off('resize');
                       nrdcontainer.remove();
                       $('head link[href="' + styleurl + '"]').remove();
                       $('body script[src="' + scripturl + '"]').remove();
                   });
               }
               
               function toggleImageSize() {
                   toolbutton.on('click', function(){
                       if(showimagesize){
                           imagesizecontainer.html('');
                           showimagesize = false;
                       } else {
                           showimagesize = true;
                           imagesizecontainer.html('');
                           showImageSize();
                       }
                   });
               }
            
               function showWindowSizeOnResize() {
                   $(window).on('resize', function () {
                       setWindowSize();
                       setImageSize();
                   });
               }
            
               function setWindowSize() {
                   topbar.text($(window).width() + ' x ' + $(window).height() + ' (inner: ' + window.innerWidth + ' x '+ window.innerHeight + ') | ');
               }
            
               function showImageSize() {
                   if(showimagesize){
                       $('img').each(function(){
                           var $img = $(this);
                           if($img.is(':visible')){
                               var $pos = $img.offset();
                               var $marker = $('<span class=\'namics-responsive-debug-elem\'>' + $img.width() + ' x ' + $img.height() + '</span>');
                               $marker.css('top', $pos.top);
                               $marker.hide();
                               imagesizecontainer.append($marker);
                               var markerwidth = $marker.outerWidth() + 1;
                               $marker.css('left', $pos.left + $img.width() - markerwidth);
                               $marker.css('widht', markerwidth);
                               $marker.show();
                           }
                       });
                   }
               }
            
               function setImageSize() {
                   if(showimagesize){
                       imagesizecontainer.html('');
                       clearTimeout(imgsizetimer);
                       imgsizetimer = setTimeout(function(){
                           showImageSize();
                       }, 500);
                   }
               }
               
               init();
            })();
    }
     
})();