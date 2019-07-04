/*!
 * atomicjs v3.2.0: A tiny vanilla JS Ajax/HTTP plugin with great browser support
 * (c) 2017 Chris Ferdinandi
 * MIT License
 * https://github.com/cferdinandi/atomic
 * Originally created and maintained by Todd Motto - https://toddmotto.com
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.atomic = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, (function (root) {

	'use strict';

	//
	// Variables
	//

	var atomic = {}; // Object for public APIs
	var supports = !!root.XMLHttpRequest && !!root.JSON; // Feature test
	var settings;

	// Default settings
	var defaults = {
		type: 'GET',
		url: null,
		data: {},
		callback: null,
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		},
		responseType: 'text',
		withCredentials: false
	};


	//
	// Methods
	//

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Setup extended object
		var extended = {};

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					if ( Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
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

	};

	/**
	 * Parse text response into JSON
	 * @private
	 * @param  {String} req The response
	 * @return {Array}      A JSON Object of the responseText, plus the orginal response
	 */
	var parse = function (req) {
		var result;
		if (settings.responseType !== 'text' && settings.responseType !== '') {
			return [req.response, req];
		}
		try {
			result = JSON.parse(req.responseText);
		} catch (e) {
			result = req.responseText;
		}
		return [result, req];
	};

	/**
	 * Convert an object into a query string
	 * @private
	 * @@link  https://blog.garstasio.com/you-dont-need-jquery/ajax/
	 * @param  {Object|Array|String} obj The object
	 * @return {String}                  The query string
	 */
	var param = function (obj) {
		if (typeof (obj) === 'string') return obj;
		if (/application\/json/i.test(settings.headers['Content-type']) || Object.prototype.toString.call(obj) === '[object Array]') return JSON.stringify(obj);
		var encoded = [];
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
			}
		}
		return encoded.join('&');
	};

	/**
	 * Make an XML HTTP request
	 * @private
	 * @return {Object} Chained success/error/always methods
	 */
	var xhr = function () {

		// Our default methods
		var methods = {
			success: function () {},
			error: function () {},
			always: function () {}
		};

		// Override defaults with user methods and setup chaining
		var atomXHR = {
			success: function (callback) {
				methods.success = callback;
				return atomXHR;
			},
			error: function (callback) {
				methods.error = callback;
				return atomXHR;
			},
			always: function (callback) {
				methods.always = callback;
				return atomXHR;
			}
		};

		// Create our HTTP request
		var request = new XMLHttpRequest();

		// Setup our listener to process compeleted requests
		request.onreadystatechange = function () {

			// Only run if the request is complete
			if ( request.readyState !== 4 ) return;

			// Parse the response text
			var req = parse(request);

			// Process the response
			if (request.status >= 200 && request.status < 300) {
				// If successful
				methods.success.apply(methods, req);
			} else {
				// If failed
				methods.error.apply(methods, req);
			}

			// Run always
			methods.always.apply(methods, req);

		};

		// Setup our HTTP request
		request.open(settings.type, settings.url, true);
		request.responseType = settings.responseType;

		// Add headers
		for (var header in settings.headers) {
			if (settings.headers.hasOwnProperty(header)) {
				request.setRequestHeader(header, settings.headers[header]);
			}
		}

		// Add withCredentials
		if (settings.withCredentials) {
			request.withCredentials = true;
		}

		// Send the request
		request.send(param(settings.data));

		return atomXHR;
	};

	/**
	 * Make a JSONP request
	 * @private
	 * @return {[type]} [description]
	 */
	var jsonp = function () {
		// Create script with the url and callback
		var ref = root.document.getElementsByTagName( 'script' )[ 0 ];
		var script = root.document.createElement( 'script' );
		settings.data.callback = settings.callback;
		script.src = settings.url + (settings.url.indexOf( '?' ) + 1 ? '&' : '?') + param(settings.data);

		// Insert script tag into the DOM (append to <head>)
		ref.parentNode.insertBefore( script, ref );

		// After the script is loaded and executed, remove it
		script.onload = function () {
			this.remove();
		};
	};

	/**
	 * Make an Ajax request
	 * @public
	 * @param  {Object} options  User settings
	 * @return {String|Object}   The Ajax request response
	 */
	atomic.ajax = function (options) {

		// feature test
		if ( !supports ) return;

		// Merge user options with defaults
		settings = extend( defaults, options || {} );

		// Make our Ajax or JSONP request
		return ( settings.type.toLowerCase() === 'jsonp' ? jsonp() : xhr() );

	};


	//
	// Public APIs
	//

	return atomic;

}));
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


                    childLayerMeta = childlayers.find(function (el) {
                        return el.layerCommand.metadata;
                    });

                    if (childLayerMeta && childLayerMeta.layerCommand) {
                        layerCommand = childLayerMeta.layerCommand;
                        metadata = childLayerMeta.layerCommand.metadata;
                        //canvas = childLayerMeta.layerCommand.info.canvas;
                    }

                    self.generateData({
                        data: metadata,
                        layerCommand: layerCommand,
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
                        var nodeSize = $sources[k].getAttribute('media');
                        var srcArray = src.split(',');
                        var x1;
                        var x2;
                        var query;

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

                        nameParsed = withoutQuery[0].split('/');
                        query = withoutQuery[1] || '';
                        nameParsed = nameParsed[nameParsed.length - 1];

                        nodeSize = nodeSize.split('and');

                        nodeSize = nodeSize.map(Function.prototype.call, String.prototype.trim);

                        var resultObj = {
                            polygonCallbacks: img.polygonCallbacks,
                            hotspotCallbacks: img.hotspotCallbacks,
                            name: nameParsed,
                            query: query,
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
                        return min <= windowSize && max >= windowSize;
                    });

                    if (imgObj) {
                        img = imgObj;
                        img.breakpoints = breakpoints;
                    } else {
                        var $img = self.findImg(img);

                        src = $img.getAttribute('srcset');
                        srcArray = src.split(',');

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

                        query = withoutQuery[1] || '';

                        img.query = query;
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
        this.getImgData(function (imgInfo) {
            self.iteratePoints(imgInfo);
            self.checkResizeSubscription();
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

            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);

            $elem.setAttribute('data-type', 'poi-hotspot');

            if ($parent && parent.dom.hasClass($parent, parent.params.containerClass)) {
                var pointX = point.points.x * imgInfo.dimensions.width;
                var pointY = point.points.y * imgInfo.dimensions.height;
                var canvas = imgInfo.canvas;
                var layerCommand = imgInfo.layerCommand;
                var tileEndW = layerCommand.tileEndW;
                var tileEndH = layerCommand.tileEndH;
                var newX;
                var newY;
                var needRecalculate = imgInfo.changeSize;

                if (canvas) {
                    var canvasX = canvas.x;
                    var canvasY = canvas.y;
                    var canvasW = canvas.width;
                    var canvasH = canvas.height;

                    newX = (pointX - canvasX) * 100 / canvasW;


                    newY = (pointY - canvasY) * 100 / canvasH;

                }
                if (needRecalculate) {
                    if (newX <= 100 && newY <= 100) {
                        $elem.style.position = 'absolute';
                        $elem.style.left = newX + '%';
                        $elem.style.top = newY + '%';

                        $elem.setAttribute('data-name', imgInfo.name);

                        $parent.style.position = 'relative';
                        $parent.appendChild($elem);
                    }

                } else if (!needRecalculate) {
                    var x;
                    var y;

                    if (canvasX) {
                        x = (point.points.x * tileEndW - canvasX) * 100 / canvasW;

                        // x = (point.points.x * (imgInfo.dimensions.width + canvasX)) * 100 / canvasW;
                    } else {
                        x = point.points.x * 100;
                    }

                    if (canvasY) {
                        y = (point.points.y * tileEndH - canvasY) * 100 / canvasH;


                        //y = (point.points.y * (canvasH + canvasY + canvasY) - canvasY) * 100 / canvasH;
                    } else {
                        y = point.points.y * 100;
                    }

                    if (x <= 100 && y <= 100) {
                        $elem.style.position = 'absolute';
                        $elem.style.left = x + '%';
                        $elem.style.top = y + '%';

                        $elem.setAttribute('data-name', imgInfo.name);

                        $parent.style.position = 'relative';
                        $parent.appendChild($elem);
                    }

                }

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
            } else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        },

        removeOthers: function (imgInfo) {
            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);
            var otherHotspots = $parent && $parent.querySelectorAll('[data-type="poi-hotspot"]');

            if (!otherHotspots) {
                return false;
            }

            for (var i = otherHotspots.length - 1; i >= 0; i--) {
                $parent && $parent.removeChild(otherHotspots[i]);
            }

        }
    };
    return methods;
}
;


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
            var canvas = imgInfo.canvas;
            var layerCommand = imgInfo.layerCommand;
            var tileEndW = layerCommand.tileEndW;
            var tileEndH = layerCommand.tileEndH;

            if (!$parent) {
                return false;
            }

            if (canvas) {
                var canvasX = canvas.x;
                var canvasY = canvas.y;
                var canvasW = canvas.width;
                var canvasH = canvas.height;
            }

            if (!imgInfo.svg) {
                $svg = document.createElementNS(svgNS, 'svg');
                $svg.setAttributeNS(null, 'viewBox', '0 0 ' + (canvasW || imgInfo.dimensions.width) + ' ' + (canvasH || imgInfo.dimensions.height));
                $svg.setAttributeNS(null, 'data-name', imgInfo.name + '?' + imgInfo.data.query);
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
                var needRender = true;

                point.points.forEach(function (v, ind) {
                    var x = imgInfo.dimensions.width * v.x;
                    var y = imgInfo.dimensions.height * v.y;

                    if (tileEndW > 0) {
                        x = (v.x * tileEndW - canvasX)
                    } else {
                        x = Math.abs(canvasX - x);
                    }

                    if (tileEndH > 0) {
                        y = (v.y * tileEndH - canvasY)
                    } else {
                        y = Math.abs(canvasY - y);
                    }

                    /*if (x > canvasW || x > imgInfo.dimensions.width || y > canvasH || y > imgInfo.dimensions.height) {
                        needRender = false;
                    }*/

                    pointsCalc += (x + ',' + y + ' ');
                });

                if (needRender) {
                    $elem.setAttributeNS(null, 'points', pointsCalc);

                    $svg.appendChild($group);
                    $group.appendChild($elem);
                }

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
            } else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        },

        hideOthers: function (point, imgInfo) {
            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);
            var otherPolygons = $parent && $parent.getElementsByTagName('svg');

            if (!otherPolygons || !otherPolygons.length) {
                return false;
            }

            for (var i = otherPolygons.length - 1; i >= 0; i--) {
                if (otherPolygons[i].getAttribute('data-name') === imgInfo.name + '?' + imgInfo.data.query) {
                    otherPolygons[i].style.display = 'block';
                } else {
                    otherPolygons[i].style.display = 'none';
                }
            }
        }
    };

    return methods;
};

