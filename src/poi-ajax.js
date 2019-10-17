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