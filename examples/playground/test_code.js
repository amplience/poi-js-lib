window.PoiLibCode = {};
window.PoiLibCode["defaults"] = {
    "poiJsSrc": "https://dev-solutions.s3.amazonaws.com/poi-js-lib/poi-lib.min.js",
    "poiCssSrc": "https://dev-solutions.s3.amazonaws.com/poi-js-lib/poi.css",
    "account": "csdemo",
    "imgName": "img_1664_5",
    "imgClass": "js-poi-img",
    "containerClass": "js-poi-img-container",
    "basePath": "https://us.billabong.com/shop/product/",
    "path": "https://i1.adis.ws/"
};
window.PoiLibCode["appendScriptStyles"] = function (callback) {
    var self = this;

    var style = document.createElement("link")
    style.setAttribute("rel", "stylesheet")
    style.setAttribute("type", "text/css")
    style.setAttribute("href", self.defaults.poiCssSrc);
    document.head.appendChild(style);

    var script = document.createElement('script');
    script.onload = function () {
        callback.call(self);
    };
    script.src = self.defaults.poiJsSrc;
    document.head.appendChild(script);
};
window.PoiLibCode["findPOIClasses"] = function (imgName) {
    var self = this;
    var imgs = Array.prototype.slice.call(document.querySelectorAll("img"));
    var filteredImgs = imgs.filter(function (img) {
        return img.src.indexOf(imgName) !== -1;
    });

    if (filteredImgs.length > 1) {
        console.log(filteredImgs);
        console.warn('More then one image is found with name: ' + imgName + '. Using first one');
    }

    var img = filteredImgs[0];
    img.classList.add(self.defaults.imgClass);
    console.log(img);


    var container = img.parentElement;
    container.classList.add(self.defaults.containerClass);

    return {
        imgClass: self.defaults.imgClass,
        containerClass: self.defaults.containerClass
    }
};
window.PoiLibCode["initPOI"] = function (opts, jsonData) {
    var self = this;
    var classes = self.findPOIClasses(opts.imgName);

    var poi = new POI({
        domain: self.defaults.path,
        account: opts.account,
        containerClass: classes.containerClass,
        imgClass: classes.imgClass,
        images: [
            {
                name: opts.imgName,
                data: jsonData ? jsonData : (self.defaults.jsonData || false),
                hotspotCallbacks: [
                    {
                        target: "*",
                        action: "click",
                        callback: function (evt, settings) {
                            window.open(
                                opts.basePath + settings.hotspot.target,
                                '_blank'
                            )
                        }
                    },
                    {
                        target: "*",
                        action: 'mouseover',
                        callback: function (evt, settings) {
                            console.log('test');

                            settings.$target.classList.add('hovered');
                        }
                    },
                    {
                        target: "*",
                        action: 'mouseout',
                        callback: function (evt, settings) {
                            settings.$target.classList.remove('hovered');
                        }
                    }
                ]
            }
        ]
    });
    poi.init();
};
window.PoiLibCode.appendScriptStyles(function () {
    window.PoiLibCode.initPOI(window.PoiLibCode.defaults);
})