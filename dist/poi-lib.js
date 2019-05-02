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
                            var src = imgWithName.getAttribute('src');
                            var name = src.split('/');
                            name = name[name.length - 1];

                            if (self.namedImages[name]) {
                                return false;
                            }
                            var imgObject = {
                                name: name,
                                hotspotCallbacks: imgToGetData.hotspotCallbacks,
                                areaCallbacks: imgToGetData.areaCallbacks,
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
                                atomic.ajax({
                                    url: self.params.domain + '/i/' + self.params.account + '/' + imgObject.name + '.json?metadata=true&func=amp.jsonReturn&v=' + new Date().getTime()
                                })
                                    .success(function (data) {
                                        self.generateData({
                                            data: data,
                                            img: imgObject,
                                            callback: function (imgInfo) {
                                                callback(imgInfo);
                                            }
                                        });
                                    })
                                    .error(function (err) {
                                        console.error('Image failed to load', err);
                                    });
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

                        if (img && !img.areaCallbacks) {
                            img.areaCallbacks = imgs[i].areaCallbacks;
                        }

                        if (img && !img.hotspotCallbacks) {
                            img.hotspotCallbacks = imgs[i].hotspotCallbacks;
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
                        atomic.ajax({
                            url: self.params.domain + '/i/' + self.params.account + '/' + img.name + '.json?metadata=true&func=amp.jsonReturn&v=' + new Date().getTime()
                        })
                            .success(function (data) {
                                self.generateData({
                                    data: data,
                                    img: img,
                                    callback: function (imgInfo) {
                                        callback(imgInfo);
                                    }
                                });
                            })
                            .error(function (err) {
                                console.error('Image failed to load', err);
                            });
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
        var regExp = new RegExp(img.name);
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
        var areaInterest = this.areaInterest();
        var points = imgInfo.points;

        hotspots.removeOthers(imgInfo);

        for (var i = points.length - 1; i >= 0; i--) {
            if (points[i].points.constructor === Array) {
                areaInterest.hideOthers(points[i], imgInfo);
                areaInterest.create(points[i], imgInfo);
            } else {
                hotspots.create(points[i], imgInfo);
            }
        }
    },
    assignEvents: function ($elem, target, callbacks, params) {
        //Loop over events callback, defined in params, and assign them to hotspots or area of interest
        if (callbacks && callbacks.length > 0) {
            for (var z = callbacks.length - 1; z >= 0; z--) {
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

                var x = point.points.x.toString().slice(2);
                x = x.substr(0, 2) + '.' + x.substr(2);

                var y = point.points.y.toString().slice(2);
                y = y.substr(0, 2) + '.' + y.substr(2);

                $elem.style.position = 'absolute';
                $elem.style.left = x + '%';
                $elem.style.top = y + '%';

                $elem.setAttribute('data-name', imgInfo.name);

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
            } else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        },

        removeOthers: function (imgInfo) {
            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);
            var otherHotspots = $parent.querySelectorAll('[data-type="poi-hotspot"]');

            for (var i = otherHotspots.length - 1; i >= 0; i--) {
                $parent.removeChild(otherHotspots[i]);
            }

        }
    };
    return methods;
};


'use strict';

POI.prototype.areaInterest = function () {
    var parent = this;

    var methods = {
        create: function (point, imgInfo) {
            //Create hotspots, add class, styles, find parent, add event callbacks
            var callbacks = imgInfo.data.areaCallbacks;
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
                $svg.setAttributeNS(null, 'data-name', imgInfo.name);
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
                        area: point,
                        imgInfo: imgInfo
                    });
                }
            } else {
                console.warn('No parent with specified className ' + parent.params.containerClass + ' was found.');
            }
        },

        hideOthers: function (point, imgInfo) {
            var $parent = parent.dom.getClosest(imgInfo.$img, '.' + parent.params.containerClass);
            var otherAreas = $parent.getElementsByTagName('svg');

            for (var i = otherAreas.length - 1; i >= 0; i--) {
                if (otherAreas[i].getAttribute('data-name') === imgInfo.name) {
                    otherAreas[i].style.display = 'block';
                } else {
                    otherAreas[i].style.display = 'none';
                }
            }
        }
    };

    return methods;
};

