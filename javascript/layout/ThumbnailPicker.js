dojo.provide("emmahardy.layout.ThumbnailPicker");

dojo.require("dojox.image.ThumbnailPicker");

dojo.declare("emmahardy.layout.ThumbnailPicker",
	dojox.image.ThumbnailPicker,
	{
	
postCreate: function(){
	// summary: Initializes styles and listeners		
	this.inherited(arguments);
	this.connect(this.navPrev, "onmouseenter", "_startupscrolling");
	this.connect(this.navPrev, "onmouseleave", "_stopupscrolling");
	this.connect(this.navNext, "onmouseenter", "_startdownscrolling");
	this.connect(this.navNext, "onmouseleave", "_stopdownscrolling");
},

init: function(){
	// summary: Creates DOM nodes for thumbnail images and initializes their listeners 
	if(this.isInitialized) {return false;}

	var classExt = this.isHorizontal ? "Horiz" : "Vert";

	// FIXME: can we setup a listener around the whole element and determine based on e.target?	  
	dojo.addClass(this.navPrev, "prev" + classExt);
	dojo.addClass(this.navNext, "next" + classExt);
	dojo.addClass(this.thumbsNode, "thumb"+classExt);
	dojo.addClass(this.outerNode, "thumb"+classExt);

	this.navNextImg.setAttribute("src", this._blankGif);
	this.navPrevImg.setAttribute("src", this._blankGif);
	

	this.isInitialized = true;
	
	if(this.isHorizontal){
		this._offsetAttr = "offsetLeft";
		this._sizeAttr = "offsetWidth";
		this._scrollAttr = "scrollLeft";
	}else{
		this._offsetAttr = "offsetTop";
		this._sizeAttr = "offsetHeight";
		this._scrollAttr = "scrollTop";
	}

	this._updateNavControls();
	if(this.imageStore && this.request){this._loadNextPage();}
	return true;
},
_startupscrolling: function(){
	if ( 0 != this.thumbScroller.scrollTop){
		if(this.upAnimation) {
			this.upAnimation.stop();
		}
		this.upAnimation = dojox.fx.smoothScroll({
			target: { x:0, y:0},
			win: this.thumbScroller,
			duration:3000 * ( this.thumbScroller.scrollTop / dojo.marginBox(this.thumbsNode)['h'])
		});
		var self = this;
	    this.updateNavInterval = setInterval(function(scope){ 
	    	if(!dojo.isIE) {
	    		scope._updateNavControls(); 
	    	} else {
	    		self._updateNavControls();
	    	}
	    }, 100, this);
		this.upAnimation.play(10);
	}
},
	
_stopupscrolling: function(){
	if(this.upAnimation){
		this.upAnimation.stop();
	}
	if(this.updateNavInterval){
		clearInterval(this.updateNavInterval);
	}	
},
_startdownscrolling: function(){
	if ( dojo.marginBox(this.thumbsNode)['h'] != this.thumbScroller.scrollTop){
		if(this.downAnimation) {
			this.downAnimation.stop();
		}
		this.downAnimation = dojox.fx.smoothScroll({
			target: { x:0, y:dojo.marginBox(this.thumbsNode)['h']},
			win: this.thumbScroller,
			duration:3000 * ((dojo.marginBox(this.thumbsNode)['h'] - this.thumbScroller.scrollTop) / dojo.marginBox(this.thumbsNode)['h'])
		});
		var self = this;
	    this.updateNavInterval = setInterval(function(scope){ 
	    	if(!dojo.isIE) {
	    		scope._updateNavControls(); 
	    	} else {
	    		self._updateNavControls();
	    	}
	    }, 100, this);
		this.downAnimation.play(10);
	}
},
_stopdownscrolling: function(){
	if(this.downAnimation){
		this.downAnimation.stop();
	}
	if(this.updateNavInterval){
		clearInterval(this.updateNavInterval);
	}
},

_loadImage: function(data, index, callback){	
	var url = this.imageStore.getValue(data,this.imageThumbAttr);
	var img = document.createElement("img");
	var imgContainer = document.createElement("div");
	imgContainer.setAttribute("id","img_" + this.widgetid+"_"+index);
	imgContainer.appendChild(img);
	img._index = index;
	img._data = data;

	this._thumbs[index] = imgContainer;
	var loadingDiv;

	var size = dojo.marginBox(this.thumbsNode);
	var defaultSize;
	var sizeParam;
	if(this.isHorizontal){
		defaultSize = this.thumbWidth;
		sizeParam = 'w';
	} else{
		defaultSize = this.thumbHeight;
		sizeParam = 'h';
	}
	size = size[sizeParam];
	var sl = this.thumbScroller.scrollLeft, st = this.thumbScroller.scrollTop;
	dojo.style(this.thumbsNode, this._sizeProperty, (size + defaultSize + 20) + "px");
	//Remember the scroll values, as changing the size can alter them
	this.thumbScroller.scrollLeft = sl;
	this.thumbScroller.scrollTop = st;
	this.thumbsNode.appendChild(imgContainer);

	dojo.connect(img, "onload", this, function(){
		var realSize = dojo.marginBox(img)[sizeParam];
		this._totalSize += (Number(realSize) + 4);
		dojo.style(this.thumbsNode, this._sizeProperty, this._totalSize + "px");
        if(this.useLoadNotifier){
			dojo.style(loadingDiv, "width", (img.width - 4) + "px"); 
		}
		dojo.style(imgContainer, "height", img.height + "px");
		callback();
		return false;
	});
	dojo.connect(img, 'onmouseenter', function() {
		dojo.query(".selected").removeClass("selected");
		dojo.addClass(img,"selected");
		var container = dijit.byId('mainContentPane');
		var mainImage = dijit.byId(img._data['containerId'][0]);
		container.selectChild(mainImage);
	});
	
	dojo.addClass(img, "imageGalleryThumb");
	dojo.addClass(imgContainer,"imgContainer");
	img.setAttribute("src", url);
	var title = this.imageStore.getValue(data, this.titleAttr);
	if(title){ img.setAttribute("title",title); }
	
	this._updateNavControls();

},

_updateNavControls: function(){
	// summary: Updates the navigation controls to hide/show them when at
	//	the first or last images.
	var cells = [];
	var changeNavVisibility = function(node, add){
		var fn = add ? "addClass" : "removeClass";
		dojo[fn](node,"enabled");
		dojo[fn](node,"thumbClickable");
	};
	
	var pos = this.isHorizontal ? "scrollLeft" : "scrollTop";
	var size = this.isHorizontal ? "offsetWidth" : "offsetHeight";
	changeNavVisibility(this.navPrev, (this.thumbScroller[pos] > 0));
	var addClass = (this.thumbScroller[pos] + this.thumbScroller['offsetHeight']+ (dojo.isOpera > 0 ? this._scrollerSize : 0) < this.thumbsNode[size]  + this.thumbScroller['offsetTop'] );
	changeNavVisibility(this.navNext, addClass);
}

	
});