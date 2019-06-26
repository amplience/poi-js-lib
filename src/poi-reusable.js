'use strict';
window.POI = function (params) {
    this.images = [];
    this.imgsLoaded = 0;
    this.params = params;
    this.namedImagesData = {};
    this.namedImages = {};
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
                canvas: params.canvas,
                changeSize: params.changeSize,
                layerCommand: params.layerCommand,
                $img: $img,
                data: params.img,
                name: params.img.name,
                points: points,
                svg: null
            };
            self.images.push(imgInfo);
            self.namedImagesData[params.img.name] = imgInfo;
        }

        self.imgsLoaded += 1;

        params.callback(imgInfo);
    },
    getImgData: function (callback) {
        var self = this;
        var imgs = this.params.images;
        var windowSize = this.getWindowSize();
        var $imgs = document.querySelectorAll('img.' + this.params.imgClass);
        var $sources = document.getElementsByTagName('source');

        var getInfo = function (imgObject) {
            var queryStr = imgObject.query || '';
            var query = imgObject.name.includes('?') ? '&X-Amp-Trace=true&v=' + new Date().getTime() : '?' + queryStr + '&X-Amp-Trace=true&v=' + new Date().getTime();
            atomic.ajax({
                url: self.params.domain + '/i/' + self.params.account + '/' + imgObject.name + query
            })
                .success(function (data) {
                    var translate = data.find(function (el) {
                        return el.type === 'translate';
                    });
                    if (!translate || !translate.data || !translate.data.output || !translate.data.output.layerCommand) {
                        return false;
                    }
                    var metadata = translate.data.output.layerCommand.metadata;
                    var layerCommand = translate.data.output.layerCommand;
                    var childlayers = translate.data.output.childlayers;
                    var canvas = translate.data.output.layerCommand.info.canvas;

                    if (!metadata) {
                        metadata = childlayers.find(function (el) {
                            return el.layerCommand.metadata;
                        });

                        if (metadata && metadata.layerCommand) {
                            layerCommand = metadata.layerCommand;
                            metadata = metadata.layerCommand.metadata;
                        }
                    }
                    self.generateData({
                        data: metadata,
                        layerCommand: layerCommand,
                        canvas: canvas,
                        changeSize: queryStr.includes('crop') || imgObject.name.includes('crop'),
                        img: imgObject,
                        callback: function (imgInfo) {
                            callback(imgInfo);
                        }
                    });
                })
                .error(function (err) {
                    console.error('Image failed to load', err);
                });
        };

        for (var x = imgs.length - 1; x >= 0; x--) {
            (function () {
                var i = x;
                var img = imgs[i];

                if (img.name === '*') {
                    for (var y = $imgs.length - 1; y >= 0; y--) {
                        (function () {
                            var j = y;
                            var imgToGetData = img;
                            var imgWithName = $imgs[j];
                            var query;
                            var srcParsed = imgWithName.getAttribute('src');
                            withoutQuery = srcParsed.split('?');

                            nameParsed = withoutQuery[0].split('/');
                            nameParsed = nameParsed[nameParsed.length - 1];

                            if (withoutQuery.length > 1) {
                                query = withoutQuery[withoutQuery.length - 1];
                            }

                            if (self.namedImages[nameParsed]) {
                                return false;
                            }
                            var imgObject = {
                                name: nameParsed,
                                query: query,
                                clearName: nameParsed,
                                hotspotCallbacks: imgToGetData.hotspotCallbacks,
                                polygonCallbacks: imgToGetData.polygonCallbacks,
                            };

                            if (imgObject && imgObject.data) {
                                self.generateData({
                                    data: imgObject.data,
                                    img: imgObject,
                                    callback: function (imgInfo) {
                                        callback(imgInfo);
                                    }
                                });
                            } else if (imgObject && self.namedImagesData[imgObject.name]) {
                                callback(self.namedImagesData[imgObject.name]);
                            } else {
                                //Calls Ajax for each image, and executes callback for each found hotspots
                                getInfo(imgObject)
                            }
                        })()
                    }
                } else {
                    if (imgs[i].breakpoints) {
                        img = imgs[i].breakpoints.find(function (el) {
                            var min = el.minWidth || 0;
                            var max = el.maxWidth || 2000;
                            return min <= windowSize && max >= windowSize;
                        });

                        if (img && !img.polygonCallbacks) {
                            img.polygonCallbacks = imgs[i].polygonCallbacks;
                        }

                        if (img && !img.hotspotCallbacks) {
                            img.hotspotCallbacks = imgs[i].hotspotCallbacks;
                        }
                    }
                    if (!img.query) {
                        var query;
                        var withoutQuery;
                        var nameParsed;

                        for (var k = $imgs.length - 1; k >= 0; k--) {
                            var srcParsed = $imgs[k].getAttribute('src');
                            withoutQuery = srcParsed.split('?');

                            nameParsed = withoutQuery[0].split('/');
                            nameParsed = nameParsed[nameParsed.length - 1];

                            if (nameParsed.includes(img.name) && withoutQuery.length > 1) {
                                query = withoutQuery[withoutQuery.length - 1];

                                if (query && nameParsed === img.name) {
                                    img.query = query;
                                }
                            }

                        }

                        for (var k = $sources.length - 1; k >= 0; k--) {
                            var src = $sources[k].getAttribute('srcset');
                            withoutQuery = src.split('?');

                            nameParsed = withoutQuery[0].split('/');
                            nameParsed = nameParsed[nameParsed.length - 1];

                            if (nameParsed.includes(img.name) && withoutQuery.length > 1) {
                                query = withoutQuery[withoutQuery.length - 1];

                                if (query && nameParsed === img.name) {
                                    img.query = query;
                                }
                            }

                        }

                    }
                    if (img && img.data) {
                        self.generateData({
                            data: img.data,
                            img: img,
                            callback: function (imgInfo) {
                                callback(imgInfo);
                            }
                        });
                    } else if (img && self.namedImagesData[img.name]) {
                        callback(self.namedImagesData[img.name]);
                    } else {
                        //Calls Ajax for each image, and executes callback for each found hotspots
                        getInfo(img)
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
        var regExp = new RegExp(img.clearName || img.name);
        var src = null;

        if (img.name === '*') {
            regExp = /[\s\S]+/g;
        }

        for (var x = $imgs.length - 1; x >= 0; x--) {
            var picture = $imgs[x].parentNode;
            if (picture && picture.tagName.toLowerCase() === 'picture') {
                var childNodes = picture.children;

                for (var y = childNodes.length - 1; y >= 0; y--) {
                    src = childNodes[y].getAttribute(attr) ? childNodes[y].getAttribute(attr).match(regExp) : childNodes[y].getAttribute('srcset').match(regExp);

                    if (src && src.length > 0) {
                        //Found image
                        $foundImg = $imgs[x];
                        break;
                    }
                }
            } else {
                src = $imgs[x].getAttribute(attr).match(regExp);

                if (src && src.length > 0) {
                    //Found image
                    $foundImg = $imgs[x];
                    break;
                }
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
        for (var x = imgData.length - 1; x >= 0; x--) {
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
        var polygons = this.polygons();
        var points = imgInfo.points;

        hotspots.removeOthers(imgInfo);

        for (var i = points.length - 1; i >= 0; i--) {
            polygons.hideOthers(points[i], imgInfo);

            if (points[i].points.constructor === Array) {
                polygons.create(points[i], imgInfo);
            } else {
                hotspots.create(points[i], imgInfo);
            }
        }
    },
    assignEvents: function ($elem, target, callbacks, params) {
        //Loop over events callback, defined in params, and assign them to hotspots or polygons
        if (callbacks && callbacks.length > 0) {
            for (var z = callbacks.length - 1; z >= 0; z--) {
                (function () {
                    var callback = callbacks[z];
                    if (callback.target === target) {
                        $elem.addEventListener(callback.action, function (evt) {
                            callback.callback(evt, params);
                        }, false);

                        if (callback.initCallback) {
                            callback.initCallback(params);
                        }
                    } else if (callback.target === '*') {
                        var findSimilarTargetEvent = callbacks.find(function (el) {
                            return (el.target === target && el.action === callback.action);
                        });

                        if (!findSimilarTargetEvent) {
                            $elem.addEventListener(callback.action, function (evt) {
                                callback.callback(evt, params);
                            }, false);

                            if (callback.initCallback) {
                                callback.initCallback(params);
                            }
                        }
                    }
                }());
            }
        }
    },

    getWindowSize: function () {
        return document.documentElement.clientWidth;
    },

    checkResizeSubscription: function () {
        var imgs = this.params.images;
        var needResizeSubscription = false;
        var resizeTimer;
        var self = this;

        for (var i = imgs.length - 1; i >= 0; i--) {
            if (imgs[i].name && imgs[i].name !== '*') {
                self.namedImages[imgs[i].name] = true;
            }
            if (imgs[i].breakpoints && imgs[i].breakpoints.length) {
                needResizeSubscription = true;
                break;
            }
        }

        if (needResizeSubscription) {
            window.onresize = function (e) {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    self.getImgData(function (imgInfo) {
                        self.iteratePoints(imgInfo);
                    });
                }, 350);
            };
        }

    },

    init: function () {
        var self = this;
        this.checkResizeSubscription();
        this.getImgData(function (imgInfo) {
            self.iteratePoints(imgInfo);
        });
    }
};

if (typeof exports === 'object') {
    module.exports = POI;
}