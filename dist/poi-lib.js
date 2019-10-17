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
'use strict';
POI.prototype.dom = {
    hasClass: function (target, className) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
    },
    getClosest: function (elem, selector) {
        /**
         * Get the closest matching element up the DOM tree.
         * @param  {Element} elem     Starting element
         * @param  {String}  selector Selector to match against (class, ID, data attribute, or tag)
         * @return {Boolean|Element}  Returns null if not match found
         */
            // Variables
        var firstChar = selector.charAt(0);
        var supports = 'classList' in document.documentElement;
        var attribute, value;

        // If selector is a data attribute, split attribute from value
        if (firstChar === '[') {
            selector = selector.substr(1, selector.length - 2);
            attribute = selector.split('=');

            if (attribute.length > 1) {
                value = true;
                attribute[1] = attribute[1].replace(/"/g, '').replace(/'/g, '');
            }
        }

        // Get closest match
        for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {

            // If selector is a class
            if (firstChar === '.') {
                if (supports) {
                    if (elem.classList.contains(selector.substr(1))) {
                        return elem;
                    }
                } else {
                    if (new RegExp('(^|\\s)' + selector.substr(1) + '(\\s|$)').test(elem.className)) {
                        return elem;
                    }
                }
            }

            // If selector is an ID
            if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            }

            // If selector is a data attribute
            if (firstChar === '[') {
                if (elem.hasAttribute(attribute[0])) {
                    if (value) {
                        if (elem.getAttribute(attribute[0]) === attribute[1]) {
                            return elem;
                        }
                    } else {
                        return elem;
                    }
                }
            }

            // If selector is a tag
            if (elem.tagName.toLowerCase() === selector) {
                return elem;
            }

        }
        return null;
    }
};
'use strict';

POI.prototype.hotspots = function () {
    var parent = this;

    var methods = {
        create: function (point, imgInfo) {
            //Create hotspots, add class, styles, find parent, add event callbacks
            var callbacks = imgInfo.data.hotspotCallbacks;
            var $elem = document.createElement('div');
            var selector = point.selector;
            var target = point.target;

            if (!selector) {
                console.warn('no selector specified');
                return;
            }

            if (selector.indexOf('.') === 0) {
                selector = selector.slice(1);
                $elem.setAttribute('class', selector);
            } else if (selector.indexOf('#') === 0) {
                selector = selector.slice(1);
                $elem.setAttribute('id', selector);
            } else {
                $elem.setAttribute('class', selector);
            }

            $elem.setAttribute('data-type', "poi-hotspot");

            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);

            if ($parent && parent.dom.hasClass($parent, parent.params.containerClass)) {

                var x = point.points.x.toString().slice(2);
                x = x.substr(0, 2) + '.' + x.substr(2);

                var y = point.points.y.toString().slice(2);
                y = y.substr(0, 2) + '.' + y.substr(2);

                $elem.style.position = 'absolute';
                $elem.style.left = x + '%';
                $elem.style.top = y + '%';

                $parent.style.position = 'relative';
                $parent.appendChild($elem);

                if (target && target.length > 0) {
                    $elem.setAttribute('data-target', target);
                    parent.assignEvents($elem, target, callbacks, {
                        $image: imgInfo.$img,
                        $target: $elem,
                        $parent: $parent,
                        hotspot: point,
                        imgInfo: imgInfo
                    });
                }
            }

            else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        }
    };
    return methods;
};


'use strict';

POI.prototype.polygons = function () {
    var parent = this;

    var methods = {
        create: function (point, imgInfo) {
            //Create hotspots, add class, styles, find parent, add event callbacks
            var callbacks = imgInfo.data.polygonCallbacks;
            var selector = point.selector;

            if (!selector) {
                console.warn('no selector specified');
                return;
            }

            var target = point.target;
            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);
            var $svg;
            var svgNS = 'http://www.w3.org/2000/svg';
            var $group = document.createElementNS(svgNS, 'g');
            var $elem = document.createElementNS(svgNS, 'polygon');

            if (!imgInfo.svg) {
                $svg = document.createElementNS(svgNS, 'svg');
                $svg.setAttributeNS(null, 'viewBox', '0 0 ' + imgInfo.dimensions.width + ' ' + imgInfo.dimensions.height);
                $parent.appendChild($svg);
                imgInfo.svg = $svg;
            } else {
                $svg = imgInfo.svg;
            }

            if (selector.indexOf('.') === 0) {
                selector = selector.slice(1);
                $elem.setAttributeNS(null, 'class', selector);
            } else if (selector.indexOf('#') === 0) {
                selector = selector.slice(1);
                $elem.setAttributeNS(null, 'id', selector);
            } else {
                $elem.setAttributeNS(null, 'class', selector);
            }

            if ($parent && parent.dom.hasClass($parent, parent.params.containerClass)) {
                var pointsCalc = '';

                point.points.forEach(function (v) {
                    pointsCalc += ((imgInfo.dimensions.width * v.x) + ',' + (imgInfo.dimensions.height * v.y) + ' ');
                });

                $elem.setAttributeNS(null, 'points', pointsCalc);

                $svg.appendChild($group);
                $group.appendChild($elem);
                if (target && target.length > 0) {
                    $elem.setAttributeNS(null, 'data-target', target);
                    parent.assignEvents($group, target, callbacks, {
                        $image: imgInfo.$img,
                        $target: $group,
                        $parent: $parent,
                        polygon: point,
                        imgInfo: imgInfo
                    });
                }
            }

            else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        }
    };

    return methods;
};


'use strict';
POI.prototype.ajax = {
// Default settings
    settings: null,
    defaults: {
        method: 'GET',
        username: null,
        password: null,
        data: {},
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        responseType: 'text',
        timeout: null,
        withCredentials: false
    },


//
// Methods
//

    /**
     * Feature test
     * @return {Boolean} If true, required methods and APIs are supported
     */
    supports: function () {
        return 'XMLHttpRequest' in window && 'JSON' in window && 'Promise' in window;
    },

    /**
     * Merge two or more objects together.
     * @param   {Object}   objects  The objects to merge together
     * @returns {Object}            Merged values of defaults and options
     */
    extend: function () {
        var self = this;
        // Variables
        var extended = {};

        // Merge the object into the extended object
        var merge = function (obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = self.extend(extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    },

    /**
     * Parse text response into JSON
     * @private
     * @param  {String} req The response
     * @return {Array}      A JSON Object of the responseText, plus the orginal response
     */
    parse: function (req) {
        var result;
        if (this.settings.responseType !== 'text' && this.settings.responseType !== '') {
            return {data: req.response, xhr: req};
        }
        try {
            result = JSON.parse(req.responseText);
        } catch (e) {
            result = req.responseText;
        }
        return {data: result, xhr: req};
    },

    /**
     * Convert an object into a query string
     * @link   https://blog.garstasio.com/you-dont-need-jquery/ajax/
     * @param  {Object|Array|String} obj The object
     * @return {String}                  The query string
     */
    param: function (obj) {

        // If already a string, or if a FormData object, return it as-is
        if (typeof (obj) === 'string' || Object.prototype.toString.call(obj) === '[object FormData]') return obj;

        // If the content-type is set to JSON, stringify the JSON object
        if (/application\/json/i.test(this.settings.headers['Content-type']) || Object.prototype.toString.call(obj) === '[object Array]') return JSON.stringify(obj);

        // Otherwise, convert object to a serialized string
        var encoded = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
            }
        }
        return encoded.join('&');

    },

    /**
     * Make an XHR request, returned as a Promise
     * @param  {String} url The request URL
     * @return {Promise}    The XHR request Promise
     */
    makeRequest: function (url) {

        // Create the XHR request
        var request = new XMLHttpRequest();
        var self = this;

        // Setup the Promise
        var xhrPromise = new Promise(function (resolve, reject) {

            // Setup our listener to process compeleted requests
            request.onreadystatechange = function () {

                // Only run if the request is complete
                if (request.readyState !== 4) return;

                // Process the response
                if (request.status >= 200 && request.status < 300) {
                    // If successful
                    resolve(self.parse(request));
                } else {
                    // If failed
                    reject({
                        status: request.status,
                        statusText: request.statusText,
                        responseText: request.responseText
                    });
                }

            };

            // Setup our HTTP request
            request.open(self.settings.method, url, true, self.settings.username, self.settings.password);
            request.responseType = self.settings.responseType;

            // Add headers
            for (var header in self.settings.headers) {
                if (self.settings.headers.hasOwnProperty(header)) {
                    request.setRequestHeader(header, self.settings.headers[header]);
                }
            }

            // Set timeout
            if (self.settings.timeout) {
                request.timeout = self.settings.timeout;
                request.ontimeout = function (e) {
                    reject({
                        status: 408,
                        statusText: 'Request timeout'
                    });
                };
            }

            // Add withCredentials
            if (self.settings.withCredentials) {
                request.withCredentials = true;
            }

            // Send the request
            request.send(self.param(self.settings.data));

        });

        // Cancel the XHR request
        xhrPromise.cancel = function () {
            request.abort();
        };

        // Return the request as a Promise
        return xhrPromise;

    },

    /**
     * Instatiate Atomic
     * @param {String} url      The request URL
     * @param {Object} options  A set of options for the request [optional]
     */
    atomic: function (url, options) {

        // Check browser support
        if (!this.supports()) throw 'Atomic: This browser does not support the methods used in this plugin.';

        // Merge options into defaults
        this.settings = this.extend(this.defaults, options || {});

        // Make request
        return this.makeRequest(url);

    }
};