dojo.provide("emmahardy.ProjectOverview");

dojo.require("dojo.back");
dojo.require("emmahardy.ProjectOverview");


dojo.declare("emmahardy.ProjectOverview",null,
{
    createProjectOverview: function(url,isMadhatter){
        var metaStore = new dojo.data.ItemFileReadStore({
            url:url
        });
        var projectPickerDiv = dojo.create('div',{
            id: 'projectPickerDiv'
        });
        dojo.place(projectPickerDiv,'content','first');
        var projectPicker = new dijit.layout.ContentPane({
            id: 'projectPicker',
            "class":'projectPicker'
        },'projectPickerDiv');
        var imageArray = [];
        metaStore.fetch({
            query: {},
            onItem: function(item,request){
                var previewContainerDiv = dojo.create('div',{
                    id:'previewContainer'
                });
                var previewContainer = new dijit.layout.ContentPane({
                    id: metaStore.getValue(item,"name") + 'preview',
                    "class":'previewContainer'
                },'previewContainer');
                var previewContent = [];
                var img = dojo.create("img");
					
                img.setAttribute("src", metaStore.getValue(item,"previewImage"));
                img.setAttribute("id", metaStore.getValue(item,"name") + 'previewimg');
                img.setAttribute("height","120px");
						
                previewContent.push(img);
		
                var label = dojo.create("div",{
                    "class":"previewDescription"
                });
                label.innerHTML = metaStore.getValue(item,"description");
                previewContent.push(label);
		
                previewContainer.attr('content',previewContent);
						
                imageArray.push(previewContainer.domNode);
            },
            onComplete: function(){
                projectPicker.attr('content',imageArray);
		
                projectPicker.startup();
                dojo.forEach(projectPicker.getChildren(),function(oneEntry, index, array) {
                    dojo.connect(dojo.byId(oneEntry.id),'onclick',projectPicker,function(evt){
				        	   
                        this.destroyRecursive();
                        var h;
                        if(dojo.isIE) {
                            h = evt.srcElement.id.substring(0,evt.srcElement.id.indexOf('previewimg'));
                        } else{
                            h = evt.currentTarget.id.substring(0,evt.currentTarget.id.indexOf('preview'));
					        	      
                        }
                        var hash =  dojo.isMozilla ? h : decodeURIComponent(h);
                        if(isMadhatter){
                            var appState = new ApplicationState({
                                proj: hash,
                                page: 1,
                                isMadhatter: true
                            },'proj='+hash + '&page=1');
                            dojo.back.addToHistory(appState);
                            var projectView = new emmahardy.ProjectView("./javascript/madhatter_overview.json",hash,1,true);
                            projectView.createProjectView();
                        } else if(hash != 'madhatter'){
                            var appState = new ApplicationState({
                                proj: hash,
                                page: 1
                            },'proj='+ hash + '&page=1');
                            dojo.back.addToHistory(appState);
                            projectView = new emmahardy.ProjectView("./javascript/images.json",hash);
                            projectView.createProjectView();
                        } else {
                            var appState = new ApplicationState({
                                proj: hash
                            },'proj='+hash);
                            dojo.back.addToHistory(appState);
                            var projectOverview = new emmahardy.ProjectOverview();
                            projectOverview.createProjectOverview("./javascript/madhatter_overview.json",true);
                        }
                    });
		        	
                });
						
            }
        });
			
			
		
    }
			
			
});
