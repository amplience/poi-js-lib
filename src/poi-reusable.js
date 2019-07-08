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
            var $img = self.findImg(params.img);

            imgInfo = {
                dimensions: {
                    width: params.data.width,
                    height: params.data.height
                },
                canvas: params.canvas,
                layerCanvas: params.layerCanvas,
                changeSize: params.changeSize,
                layerCommand: params.layerCommand,
                $img: $img,
                data: params.img,
                name: params.img.name,
                points: points,
                breakpoints: params.breakpoints,
                svg: null
            };
            self.images.push(imgInfo);
            self.namedImagesData[params.img.name + '?' + params.img.query] = imgInfo;
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
                    var childLayerMeta;
                    var layerCanvas;


                    childLayerMeta = childlayers.find(function (el) {
                        return el.layerCommand.metadata;
                    });

                    if (childLayerMeta && childLayerMeta.layerCommand) {
                        layerCommand = childLayerMeta.layerCommand;
                        metadata = childLayerMeta.layerCommand.metadata;
                        layerCanvas = childLayerMeta.layerCommand.info.canvas;
                    }

                    self.generateData({
                        data: metadata,
                        layerCommand: layerCommand,
                        layerCanvas: layerCanvas,
                        canvas: canvas,
                        changeSize: queryStr.includes('crop') || imgObject.name.includes('crop'),
                        img: imgObject,
                        breakpoints: imgObject.breakpoints,
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

                            var found = imgs.find(function (el) {
                                return el.name === nameParsed;
                            });

                            if (found) {
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
                            } else if (imgObject && self.namedImagesData[imgObject.name + '?' + imgObject.query]) {
                                callback(self.namedImagesData[imgObject.name + '?' + imgObject.query]);
                            } else {
                                //Calls Ajax for each image, and executes callback for each found hotspots
                                getInfo(imgObject)
                            }
                        })()
                    }
                } else {
                    var breakpoints = [];
                    var retina = false;
                    var withoutQuery;
                    var nameParsed;

                    if (window.devicePixelRatio > 1) {
                        retina = true;
                    }

                    for (var k = $sources.length - 1; k >= 0; k--) {
                        var src = $sources[k].getAttribute('srcset');
                        var parentNode = $sources[k].parentNode.getElementsByTagName('img');
                        var nodeSize = $sources[k].getAttribute('media');
                        var srcArray = src.split(', ');
                        var x1;
                        var x2;
                        var query;

                        parentNode = parentNode.length ? parentNode[0].getAttribute('src') : '';

                        srcArray = srcArray.map(Function.prototype.call, String.prototype.trim);

                        srcArray.forEach(function (el) {
                            if (el.includes('1x')) {
                                x1 = el;
                            } else if (el.includes('2x')) {
                                x2 = el;
                            } else {
                                x1 = el;
                            }
                        });

                        if (retina && x2) {
                            src = x2;
                        } else if (x1) {
                            src = x1;
                        }

                        withoutQuery = src.split('?');
                        parentNode = parentNode.split('?');

                        nameParsed = withoutQuery[0].split('/');
                        parentNode = parentNode[0].split('/');
                        query = withoutQuery[1] || '';
                        nameParsed = nameParsed[nameParsed.length - 1];
                        parentNode = parentNode[parentNode.length - 1];

                        nodeSize = nodeSize.split('and');

                        nodeSize = nodeSize.map(Function.prototype.call, String.prototype.trim);

                        var resultObj = {
                            polygonCallbacks: img.polygonCallbacks,
                            hotspotCallbacks: img.hotspotCallbacks,
                            name: nameParsed,
                            query: query,
                            parentName: parentNode
                        };

                        nodeSize = nodeSize.map(function (el) {
                            el = el.replace('(', '');
                            el = el.replace(')', '');
                            el = el.split(':');
                            el = el.map(Function.prototype.call, String.prototype.trim);

                            var key = el[0] && el[0] === 'max-width' ? 'maxWidth' : 'minWidth';
                            var value = el[1] ? parseInt(el[1].replace('px', ''), 10) : key === 'minWidth' ? 0 : '';

                            resultObj[key] = value;

                            return resultObj;
                        });

                        breakpoints.push(resultObj);
                    }

                    var imgObj = breakpoints.find(function (el) {
                        var min = el.minWidth || 0;
                        var max = el.maxWidth || 2000;
                        return min <= windowSize && max >= windowSize && (el.name === img.name || el.parentName === img.name);
                    });

                    if (imgObj) {
                        img = imgObj;
                        img.breakpoints = breakpoints;
                    } else {
                        var $img = self.findImg(img);
                        var nx1;
                        var nx2;
                        var nquery;

                        if (!$img) {
                            return false;
                        }

                        src = $img.getAttribute('srcset');
                        srcArray = src ? src.split(', ') : $img.getAttribute('src').split(', ');

                        srcArray = srcArray.map(Function.prototype.call, String.prototype.trim);

                        srcArray.forEach(function (el) {
                            if (el.includes('1x')) {
                                nx1 = el;
                            } else if (el.includes('2x')) {
                                nx2 = el;
                            } else {
                                nx1 = el;
                            }
                        });

                        if (retina && nx2) {
                            src = nx2;
                        } else if (nx1) {
                            src = nx1;
                        }

                        withoutQuery = src.split('?');

                        nquery = withoutQuery[1] || '';

                        img.query = nquery;
                    }

                    if (img && img.data) {
                        self.generateData({
                            data: img.data,
                            layerCommand: img.layerCommand,
                            canvas: img.canvas,
                            changeSize: img.changeSize,
                            img: img,
                            callback: function (imgInfo) {
                                callback(imgInfo);
                            }
                        });
                    } else if (img && self.namedImagesData[img.name + '?' + img.query]) {
                        callback(self.namedImagesData[img.name + '?' + img.query]);
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
        var imgs = this.images;
        var needResizeSubscription = false;
        var resizeTimer;
        var self = this;

        for (var i = imgs.length - 1; i >= 0; i--) {
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
        this.getImgData(function (imgInfo) {
            self.iteratePoints(imgInfo);
            self.checkResizeSubscription();
        });
    }
};

if (typeof exports === 'object') {
    module.exports = POI;
}