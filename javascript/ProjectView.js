dojo.provide("emmahardy.ProjectView");

dojo.require('emmahardy.ProjectOverview');
dojo.require('dojo.back');
dojo.require('dojox.image.Lightbox');

dojo.declare("emmahardy.ProjectView",null,
{
    constructor: function(storeUrl, hash, page, isMadhatter){
        this.storeUrl = storeUrl;
        this.hash = hash;
        this.page = page || 1;
        this.pageSize = 3;
        this.isMadhatter = isMadhatter || hash.substring(0,10) === 'madhatter/';
    },
	
    createProjectView: function(){

        var metaStore = new dojo.data.ItemFileReadStore({
            url:this.storeUrl
            });
        metaStore.fetch({
            scope: this,
            query: {
                name: this.hash
                },
            onItem: function(item){
                var containerDiv = dojo.create('div',{
                    id:'mainContentPane'
                });
                dojo.place(containerDiv,'content','first');
                this.container = new dijit.layout.StackContainer({
                    id:'mainContentPane'
                },'mainContentPane');
            		
                var leftNav = dojo.create('div',{
                    id: 'leftNav'
                });
                dojo.place(leftNav,'content','first');
    	            
                var scrollPane = dojo.create('div',{
                    id: 'scrollPane'
                });
                dojo.place(scrollPane,'leftNav','first');

                var backButton = dojo.create('div',{
                    id: 'backButton'
                }); 
                backButton.innerHTML = metaStore.getValue(item,"description") + ' - Page ' + this.page;
                dojo.place(backButton,'leftNav','first');

                   
                var imageStore = new dojo.data.ItemFileReadStore({
                    data: metaStore.getValue(item,"images")
                    });
                imageStore.fetch({
                    scope: this,
                    onComplete: function(items,request) {
                        this.totalCount = items.length;
                        imageStore.fetch({
                            scope: this,
                            start: (this.page -1) * this.pageSize,
                            count: this.pageSize,
                            query: {},
                            onItem: function(item,request){
                                var thumbnail = dojo.create('div');
                                var thumbImg = dojo.create("img",{
                                    src: imageStore.getValue(item,'thumb')
                                    });
                       
                                if(dojo.isIE) {
                                    dojo.removeAttr(thumbImg,"height");
                                    dojo.removeAttr(thumbImg,"width");
                                }

                                dojo.addClass(thumbImg, "imageGalleryThumb");
                                dojo.place(thumbImg,thumbnail,'first');
                                dojo.place(thumbnail,'scrollPane','last');
									
                                var imgId = imageStore.getValue(item,'containerId');
								
                                var mainContainer;
                                if(imageStore.getValue(item,'large')) {
                                    //setup image
                                    var imageHolder = new dijit.layout.ContentPane({
                                        id: imgId,
                                        'class':'imageContainer',
                                        style: 'display: none;'
                                    },imgId);
                                    mainContainer = imageHolder;
                                    var img = dojo.create('img',{'src':imageStore.getValue(item,'large')});
                                    if(dojo.isIE) {
                                        dojo.removeAttr(img,"height");
                                        dojo.removeAttr(img,"width");
												   
                                    }

                                    var descriptionText = "<span class=\"bold\">"+imageStore.getValue(item,'title') + "</span><br/>" +
                                    imageStore.getValue(item,'description_line1') + "<br/>" +
                                    imageStore.getValue(item,'description_line2') + "<br/>";

                                    var descr =  dojo.create("div",{
                                        "class": "descrption",
                                        innerHTML: descriptionText
                                    });
                                    imageHolder.domNode.appendChild(img);
                                    imageHolder.domNode.appendChild(descr);
                                    this.container.addChild(imageHolder);


                                      // create and start the lightboxes:
                                    var lb = new dojox.image.Lightbox({ modal: false, title:imageStore.getValue(item,'title'), href:imageStore.getValue(item,'large') });
                                    dojo.connect(img,'onclick',function(){
                                        lb.startup();
                                        lb.show();                                        
                                    });
                                    
                                } else {
                                    // setup slide show
                                    var slideShowDiv = dojo.create("div",{
                                        id:imgId
                                    });
                                    var slideShowStoreUrl = imageStore.getValue(item,'slideShowStore');
                                    var slideShowStore = new dojo.data.ItemFileReadStore({
                                        url: slideShowStoreUrl
                                    });
                                    var slideShow = new emmahardy.layout.SlideShow({
                                        "class":"imageContainer slideShow",
                                        noLink:true,
                                        id:imgId,
                                        pageSize: 2,
                                        loop:"true",
                                        slideshowInterval:"2",
                                        fixedHeight:true,
                                        titleTemplate: '<span class="slideShowText">${title}</span>'
                                    },imgId);
                                    mainContainer = slideShow;
                                    slideShow.setDataStore(slideShowStore,{
                                        query: {}
                                    },{
                                        imageThumbAttr: "thumb",
                                        imageLargeAttr: "large"
                                    });
                                this.container.addChild(slideShow);
										
                            }
                            // add mouseover event to thumbnail pictures
                            dojo.connect(thumbImg, 'onmouseenter', function() {
                                dojo.query(".selected").removeClass("selected");
                                dojo.addClass(thumbImg,"selected");
                                var container = dijit.byId('mainContentPane');
                                var mainImage = dijit.byId(imgId);
                                container.selectChild(mainImage);
                            });
                            //setup forward and backup pager
                            var pager = dojo.create("div",{
                                "class":"pagerContainer"
                            });
                            if(this.page > 1) {
                                var backward = dojo.create("div",{
                                    "class": "pager",
                                    style: "float: left;",
                                    innerHTML: "<< Previous Page"
                                });
                                dojo.connect(backward,'onclick',this,function(evt){
                                    this.container.destroyRecursive();
                                    dojo.query('#leftNav').orphan();
                                    this.page = parseInt(this.page) - 1;
                                    var appState = new ApplicationState({
                                        proj:this.hash,
                                        page: this.page,
                                        isMadhatter: this.isMadhatter
                                        },'proj='+this.hash+'&page='+this.page);
                                    dojo.back.addToHistory(appState);
                                    this.createProjectView();
                                });
                                dojo.place(backward, pager,"first");
                            }
                            
                            if(this.page * this.pageSize < this.totalCount) {
                                var forward = dojo.create("div",{
                                    "class": "pager",
                                    style: "float: right;",
                                    innerHTML: "Next Page >>"
                                });
                                dojo.connect(forward,'onclick',this,function(evt){
                                    this.container.destroyRecursive();
                                    dojo.query('#leftNav').orphan();
                                    this.page = parseInt(this.page) + 1;
                                    var appState = new ApplicationState({
                                        proj:this.hash,
                                        page: this.page,
                                        isMadhatter: this.isMadhatter
                                        },'proj='+this.hash+'&page='+this.page);
                                    dojo.back.addToHistory(appState);
                                    this.createProjectView();
                                });
                                dojo.place(forward, pager,"last");
                            }

                            if(this.isMadhatter) {
                                var backToAll = dojo.create("div",{
                                    "class": "pager pagerUp",
                                    innerHTML: "Back To All"
                                });
                                dojo.connect(backToAll,'onclick',this,function(evt){
                                    this.container.destroyRecursive();
                                    dojo.query('#leftNav').orphan();
                                    var appState = new ApplicationState({
                                        proj: 'madhatter'
                                    },'proj=madhatter');
                                    dojo.back.addToHistory(appState);
                                    var projectOverview = new emmahardy.ProjectOverview();
                                    projectOverview.createProjectOverview("./javascript/madhatter_overview.json",true);
                                });
                                dojo.place(backToAll, pager,"last");
                            }
                            mainContainer.domNode.appendChild(pager);
                            dojo.query("#scrollPane > div:first-child img").addClass("selected");
                        }
                        });
                }
                });
            this.container.startup();
        }
        });
			
}
});