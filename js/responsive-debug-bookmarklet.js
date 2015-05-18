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
var baseurl = 'https://namics.github.com/ResponsiveDebugBookmarklet'
var scripturl = baseurl + '/js/responsive-debug-bookmarklet.js';
var styleurl = baseurl + '/css/style.css';


(function(){
    var nrdJQuery = null;
    var script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js";
    script.onload = script.onreadystatechange = function(){
        if (nrdJQuery === null && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            nrdJQuery = jQuery.noConflict(true);
            initNamicsResponsiveDebugBookmarklet();
        }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
    
    function initNamicsResponsiveDebugBookmarklet() {
        (window.namicsResponsiveDebugBookmarklet = function() {
            /* remove already if existing */
            nrdJQuery(window).off('resize');
            nrdJQuery('#namics-responsive-debug').remove();
            var nrdcontainer = nrdJQuery('<div id="namics-responsive-debug" />');
            var topbar = nrdJQuery('<div class="namics-responsive-debug-elem nrd-topbar"><span class="nrd-topbar-close">close</span></div>');
            nrdcontainer.append(topbar);
            var toolbutton = nrdJQuery('<div class="namics-responsive-debug-elem nrd-toolbutton">Toogle picturesize</div>')
            nrdcontainer.append(toolbutton)
            var imagesizecontainer = nrdJQuery('<div />');
            nrdcontainer.append(imagesizecontainer);
            var imgsizetimer;
            var showimagesize = true;
        
            function init() {
                var remoteStorage = new CrossDomainStorage(baseurl + "/dataserver.html");
                
                nrdJQuery('head').append(nrdJQuery('<link href="' + styleurl + '" rel="stylesheet" />'));
                nrdJQuery('body').append(nrdcontainer);
                setWindowSize();
                showWindowSizeOnResize();
                showImageSize();
                initCloseListener();
                toggleImageSize();
            }
        
            function initCloseListener() {
                topbar.on('click', function(){
                    nrdJQuery(window).off('resize');
                    nrdcontainer.remove();
                    nrdJQuery('head link[href="' + styleurl + '"]').remove();
                    nrdJQuery('body script[src="' + scripturl + '"]').remove();
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
                nrdJQuery(window).on('resize', function () {
                    setWindowSize();
                    setImageSize();
                });
            }
        
            function setWindowSize() {
                topbar.text(nrdJQuery(window).width() + ' x ' + nrdJQuery(window).height() + ' (inner: ' + window.innerWidth + ' x '+ window.innerHeight + ') | ');
            }
        
            function showImageSize() {
                if(showimagesize){
                    nrdJQuery('img').each(function(){
                        var $img = nrdJQuery(this);
                        if($img.is(':visible')){
                            var $pos = $img.offset();
                            
                            var imgfilewidth, 
                                imgfileheight,
                                imgwidth = $img.width(),
                                imgheight = $img.height();
                            var $marker = nrdJQuery('<span class=\'namics-responsive-debug-elem\'>' + imgwidth + ' x ' + imgheight + '</span>');
                            $marker.css('top', $pos.top);
                            $marker.hide();

                            nrdJQuery("<img/>")
                            .attr("src", $img.attr("src"))
                            .load(function() {
                                imgfilewidth = this.width;
                                imgfileheight = this.height;
                                var info = false;
                                if(imgwidth > imgfilewidth || imgheight > imgfileheight){
                                    $marker.addClass('nrd-img-bigger');
                                    info = true;
                                }else if(imgwidth < imgfilewidth &&  imgheight < imgfileheight){
                                    $marker.addClass('nrd-img-smaller');
                                    info = true;
                                }
                                if(info)$marker.append('<br /><span class="orig">(orig: ' + imgfilewidth + ' x ' + imgfileheight + ')</span>');
                            });
                            
                            imagesizecontainer.append($marker);
                            var markerwidth = $marker.outerWidth() + 1;
                            $marker.css('left', $pos.left + imgwidth - markerwidth);
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
           
            /***************/
            /* Original Code:
             * Copyright 2010 Nicholas C. Zakas. All rights reserved.
             * BSD Licensed.
             */
            function CrossDomainStorage(server){
                this.origin = document.location.protocol + '//' + document.location.host + window.location.pathname;
                this.server = server;
                this._iframe = null;
                this._iframeReady = false;
                this._queue = [];
                this._requests = {};
                this._id = 0;
            }
            CrossDomainStorage.prototype = {
                //restore constructor
                constructor: CrossDomainStorage,
                //public interface methods
                init: function(){
                    var that = this;
                    if (!this._iframe){
                        if (window.postMessage && window.JSON && window.localStorage){
                            this._iframe = document.createElement("iframe");
                            this._iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
                            document.body.appendChild(this._iframe);
                            if (window.addEventListener){
                                this._iframe.addEventListener("load", function(){ that._iframeLoaded(); }, false);
                                window.addEventListener("message", function(event){ that._handleMessage(event); }, false);
                            } else if (this._iframe.attachEvent){
                                this._iframe.attachEvent("onload", function(){ that._iframeLoaded(); }, false);
                                window.attachEvent("onmessage", function(event){ that._handleMessage(event); });
                            }
                        } else {
                            throw new Error("Unsupported browser.");
                        }
                    }
                    this._iframe.src = this.server;
                },
                getValue: function(key, callback){
                    var request = {
                            key: key,
                            id: ++this._id
                        };
                    this._process(request, callback)
                },
                setValue: function(key, value){
                    var request = {
                            key: key,
                            value: value
                        };
                    this._process(request, null)
                },
                removeValue: function(key){
                    var request = {
                            key: key,
                            value: null
                        };
                    this._process(request, null)
                },
               //private methods
                _process: function(request, callback){
                    var data = {
                                request: request,
                                callback: callback
                               };
                    if (this._iframeReady){
                        this._sendRequest(data);
                    } else {
                        this._queue.push(data);
                    }   
                    if (!this._iframe){
                        this.init();
                    }
                },
                _sendRequest: function(data){
                    this._requests[data.request.id] = data;
                    this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.server);
                },
                _iframeLoaded: function(){
                    this._iframeReady = true;
                    if (this._queue.length){
                        for (var i=0, len=this._queue.length; i < len; i++){
                            this._sendRequest(this._queue[i]);
                        }
                        this._queue = [];
                    }
                },
                _handleMessage: function(event){
                    var data = JSON.parse(event.data);
                    this._requests[data.id].callback(data.key, data.value);
                    delete this._requests[data.id];
                }
            };
            /**************/
            init();
        })();
    }
})();