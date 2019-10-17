'use strict';
window.POI = function (params) {
    this.images = [];
    this.imgsLoaded = 0;
    this.params = params;
};

window.POI.prototype = {
    generateData: function (params) {
        var self = this;
        var points = self.getHotspots(params.data);
        var imgInfo;

        if (points !== null) {
            var $img = self.findImg(params.img, self.params);

            imgInfo = {
                dimensions: {
                    width: params.data.width,
                    height: params.data.height
                },
                $img: $img,
                data: params.img,
                name: params.img.name,
                points: points,
                svg: null
            };
            self.images.push(imgInfo);
        }

        self.imgsLoaded += 1;
        params.callback(imgInfo);
    },
    getImgData: function (callback) {
        var self = this;
        var imgs = this.params.images;
        var $imgs = document.querySelectorAll('img.' + this.params.imgClass);

        var getImgData = function (img) {
            self.ajax.atomic(self.params.domain + '/i/' + self.params.account + '/' + img.name + '.json?metadata=true&func=amp.jsonReturn&v=' + new Date().getTime())
                .then(function (dataObj) {
                    var data = dataObj.data;
                    self.generateData({
                        data: data,
                        img: img,
                        callback: function (imgInfo) {
                            callback(imgInfo);
                        }
                    });
                })
        };

        for (var x = 0; x < imgs.length; x++) {
            (function () {
                var i = x;
                if (imgs[i].name === '*') {
                    for (var y = 0; y < $imgs.length; y++) {
                        (function () {
                            var j = y;
                            var imgWithName = $imgs[j];
                            var srcParsed = imgWithName.getAttribute('src');
                            var nameParsed;
                            var withoutQuery = srcParsed.split('?');

                            nameParsed = withoutQuery[0].split(self.params.account + '/');
                            nameParsed = nameParsed[nameParsed.length - 1].split('/');
                            nameParsed = nameParsed[0];

                            var found = imgs.find(function (el) {
                                return el.name === nameParsed;
                            });

                            if (found) {
                                return false;
                            }

                            getImgData({
                                name: nameParsed,
                                hotspotCallbacks: imgs[i].hotspotCallbacks,
                                polygonCallbacks: imgs[i].polygonCallbacks
                            });
                        })()
                    }
                } else {
                    if (imgs[i].data) {
                        self.generateData({
                            data: imgs[i].data,
                            img: imgs[i],
                            callback: function (imgInfo) {
                                callback(imgInfo);
                            }
                        });
                    } else {
                        //Calls Ajax for each image, and executes callback for each found hotspots
                        getImgData(imgs[i]);
                    }
                }
            }());
        }
    },
    findImg: function (img) {
        //Finds image inside html by src attribute and matches it to name of image from ajax call
        var $imgs = document.querySelectorAll('img.' + this.params.imgClass);
        var attr = this.params.imgAttribute || 'src';
        var $foundImg = null;
        for (var x = 0; x < $imgs.length; x++) {
            var regExp = new RegExp(img.name);
            var src = $imgs[x].getAttribute(attr).match(regExp);

            if (src && src.length > 0) {
                //Found image
                $foundImg = $imgs[x];
                break;
            }
        }

        return $foundImg;
    },
    getHotspots: function (imgData) {
        //Forms and returns array of hotSpots from ajax call
        var poiArr = null;
        if (imgData.constructor !== Array) {
            imgData = [imgData];
        }
        for (var x = 0; x < imgData.length; x++) {
            if (imgData[x] &&
                imgData[x].metadata &&
                imgData[x].metadata.hotSpots &&
                imgData[x].metadata.hotSpots.constructor === Object &&
                imgData[x].metadata.hotSpots.hotSpots &&
                imgData[x].metadata.hotSpots.hotSpots.constructor === Object &&
                imgData[x].metadata.hotSpots.hotSpots.list &&
                imgData[x].metadata.hotSpots.hotSpots.list.length > 0
            ) {
                poiArr = imgData[x].metadata.hotSpots.hotSpots.list;
            }
        }
        return poiArr;
    },

    iteratePoints: function (imgInfo) {
        if (!imgInfo) {
            return;
        }

        var hotspots = this.hotspots();
        var areaInterest = this.polygons();
        var points = imgInfo.points;

        for (var i = 0; i < points.length; i++) {
            if (points[i].points.constructor === Array) {
                areaInterest.create(points[i], imgInfo);
            }
            else {
                hotspots.create(points[i], imgInfo);
            }
        }
    },
    assignEvents: function ($elem, target, callbacks, params) {
        //Loop over events callback, defined in params, and assign them to hotspots or polygon
        if (callbacks && callbacks.length > 0) {
            for (var z = 0; z < callbacks.length; z++) {
                (function () {
                    var callback = callbacks[z];
                    if (callback.target === target || callback.target === '*') {
                        $elem.addEventListener(callback.action, function (evt) {
                            callback.callback(evt, params);
                        }, false);

                        if (callback.initCallback) {
                            callback.initCallback(params);
                        }
                    }
                }());
            }
        }
    },

    init: function () {
        var self = this;
        this.getImgData(function (imgInfo) {
            self.iteratePoints(imgInfo);
        });
    }
};

if (typeof exports === 'object') {
    module.exports = POI;
}