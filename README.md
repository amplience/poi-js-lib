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
                hotspotCallbacks:[
                    {
                        target: "mountain left",
                        action: "click",
                        callback: function(evt, settings){
                            console.log('yay, i was clicked :)', settings);
                        }
                    }
                    ]
            },
            {
                name: "zinc_4a_zinc_tealandbluecombination_view2",
                polygonCallbacks:[
                    {
                        target: "rightLeg",
                        action: "click",
                        callback: function(evt, settings){
                            console.log('yay, i was clicked :)', settings);
                        }
                    }
                ]
            },
            {
                name: "*",
                hotspotCallbacks:[
                {
                    target: "*",
                    action: "click",
                    callback: function(evt, settings){
                        console.log('yay, i was clicked :)', settings);
                    }
                }
                ],
                polygonCallbacks:[
                    {
                        target: "*",
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

There is simple way to render hotspots and polygons for all images. For this specify image name as * and target of callbacks as *, too.
Images configuration with specified names (not *) will be more priorited.

If you want to use picture tad, please specify it next way:

```html
    <picture>
        <source srcset="//i1-qa.adis.ws/i/tesco/1-shutterstock_588634790-825x465?w=768 1x, //i1-qa.adis.ws/i/tesco/1-shutterstock_588634790-825x465?w=1046 2x"
                type="image/webp"
                media="(max-width: 768px) and (min-width: 0px)">
        <source srcset="//i1-qa.adis.ws/i/tesco/1-shutterstock_588634790-825x465?w=768 1x, //i1-qa.adis.ws/i/tesco/1-shutterstock_588634790-825x465?w=1046 2x"
                media="(max-width: 768px) and (min-width: 0px)">
        <img class="js-poi-img another class"
             src="//i1-qa.adis.ws/i/tesco/100023354_JJ"
             srcset="//i1-qa.adis.ws/i/tesco/100023354_JJ?w=1024&layer0=[scaleFit=poi&poi={$this.metadata.pointOfInterest.x},{$this.metadata.pointOfInterest.y},{$this.metadata.pointOfInterest.w},{$this.metadata.pointOfInterest.h}&sm=c&aspect=1:1&w=768&h=768]&layer0=[src=/i//100023354_JJ] 1x, //i1-qa.adis.ws/i/tesco/100023354_JJ?w=2048&layer0=[scaleFit=poi&poi={$this.metadata.pointOfInterest.x},{$this.metadata.pointOfInterest.y},{$this.metadata.pointOfInterest.w},{$this.metadata.pointOfInterest.h}&sm=c&aspect=1:1&w=768&h=768]&layer0=[src=/i//100023354_JJ] 2x">
    </picture>
```

Use media with min amd max width. Also base src for image and srcset.

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

### Event handlers example attached to polygon ###



```
#!javascript
polygonCallbacks:[
        {
            target: "rightPillow",
            action: "click",
            callback: function(evt, settings){
                console.log('yay, i was clicked :)', settings);
            }
        }
    ]

```

### Specifying universal callback for every hotspot\polygon



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
                console.log('init callback polygon', settings);
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
