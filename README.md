# README #

This lib allows to add responsive hotspots to specified images

### Prerequisite ###
It is preferred to use **node** v7+

### Installation ###

* npm install
* gulp


### Usage ###


```
#!javascript

POI.init({
        domain: 'http://i1.adis.ws',
        account: 'your_account_name',
        containerClass: 'img-container',
        imgClass: 'js-poi-img',
        images: [
            {
               name: "large1",
               // data: {"isImage":true,"alpha":false,"width":4273,"height":2268,"format":"JPEG","metadata":{"image":{"colorSpace":"rgb","resolutionY":72,"valid":true,"resolutionX":72,"depth":8,"alpha":false,"format":"JPEG","width":4273,"id":"bfbc9a80-c2ef-4df7-837a-2fa25be1824a","height":2268,"resolutionUnits":1},"hotSpots":{"hasPolygon":true,"hotSpots":{"list":[{"selector":"img-point","id":"475e1c78-55f0-42fe-a841-870fbf18785c","type":"sku","points":{"x":0.82334144592285,"y":0.85594985064338},"target":"rightLeg"},{"selector":".img-point-2","id":"43041d6f-aa1e-4654-b24d-3cd5b9cc1568","type":"sku","points":{"x":0.11536297798157,"y":0.69578024471507},"target":"leftLeg"},{"selector":".img-area","id":"c17448ea-cf85-43e2-a5f4-16277250f95b","type":"sku","points":[{"x":0.72445787512352,"y":0.19781434697355},{"x":0.8297635232058,"y":0.19781434697355},{"x":0.8297635232058,"y":0.42811810702956},{"x":0.72445787512352,"y":0.42811810702956}],"target":"rightPillow"},{"selector":"img-point-2","id":"eae74187-2d3c-4ede-aa7c-43835addc4b3","type":"sku","points":{"x":0.27611713409424,"y":0.3154537784352},"target":"leftPillow"},{"selector":"img-area","id":"91e379bd-13a3-46f0-8e37-4786336fe699","type":"sku","points":[{"x":0.38189503211493,"y":0.43744145425146},{"x":0.50689503211493,"y":0.43744145425146},{"x":0.50689503211493,"y":0.67273557189852},{"x":0.38189503211493,"y":0.67273557189852}],"target":"middle"}]},"hasPoint":true},"file":{"size":1233166,"id":"bfbc9a80-c2ef-4df7-837a-2fa25be1824a","type":"JPEG"},"pointOfInterest":{"w":0.125,"h":0.23529411764706,"x":0.17789419174194,"y":0.061920201918658},"exif":{"gpsLocation":"0.0, 0.0","orientation":1,"exposureTime":"1\/160","software":"Adobe Photoshop CS6 (Macintosh)","taken":1397049205,"isoSpeed":100,"model":"Canon EOS 5D Mark III","id":"bfbc9a80-c2ef-4df7-837a-2fa25be1824a","make":"Canon","focalLength":"50\/1"}},"status":"ok"},
                hotspotCallbacks:[
                    {
                        target: "mountain left",
                        action: "click",
                        callback: function(evt, settings){
                            console.log('yay, i was clicked :)', settings);
                        }
                    }
            },
            {
                name: "zinc_4a_zinc_tealandbluecombination_view2",
                areaCallbacks:[
                    {
                        target: "rightLeg",
                        action: "click",
                        callback: function(evt, settings){
                            console.log('yay, i was clicked :)', settings);
                        }
                    }
                ]
            }
        ]
    });
```


### Params ###

* **domain**: Domain where image is hosted
* **account**: Account, on which image is located
* **containerClass**: Parent class name, inside which image is located
* **imgClass**: Image class name, to which hotspots will be applied
* **images**: Array of images with image names and callbacks for hotspots
* **data**: You can specify data directly if you already retrieved it from another AJAX request.
This way, there is no need to make new AJAX request. 
In the example above this param is commented out for demonstration purposes


### Event handlers example attached to hotspots ###



```
#!javascript
hotspotCallbacks:[
        {
            target: "mountain left",
            action: "click",
            callback: function(evt, settings){
                console.log('yay, i was clicked :)', settings);
            }
        }
    ]

```

### Event handlers example attached to area of interest ###



```
#!javascript
areaCallbacks:[
        {
            target: "rightPillow",
            action: "click",
            callback: function(evt, settings){
                console.log('yay, i was clicked :)', settings);
            }
        }
    ]

```

### Specifying universal callback for every hotspot\area of interest



```
#!javascript
hotspotCallbacks:[
    {
            target: "*",
            action: "click",
            callback: function(evt, settings){
                console.log('generic click', settings);
    
            },
            initCallback: function(settings){
                console.log('init callback area', settings);
            }
    }
]
```

### Event handlers options ###


* **target**: hotspot target (defined in DAM)
* **action**: action on which hotspot will react. E.g 'click', 'mouseover'
* **callback**: callback function for action


### Integration Tests ###

In terminal run ```npm run server```

Open new terminal window and run ```npm run test```

### License ###
This software is provided under Apache License, Version 2.0. More details in ```README.md```