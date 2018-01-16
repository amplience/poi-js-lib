(function ($) {
    window.POIGenerator = {
        generatedCode: {
            defaults: {
                poiJsSrc: 'https://dev-solutions.s3.amazonaws.com/poi-js-lib/poi-lib.min.js',
                poiCssSrc: 'https://dev-solutions.s3.amazonaws.com/poi-js-lib/css/poi.css'
            },
            appendScriptStyles: null,
            findPOIClasses: null,
            initPOI: null
        },
        defaults: {
            account: 'csdemo',
            imgName: 'img_1664_5',
            imgClass: 'js-poi-img',
            containerClass: 'js-poi-img-container',
            basePath: 'https://us.billabong.com/shop/product/',
            path: 'https://i1.adis.ws/',
            jsonData: null
        },
        findPOIClasses: function (imgName) {
            var self = this;
            var imgs = Array.prototype.slice.call(document.querySelectorAll("img"));
            var filteredImgs = imgs.filter(function (img) {
                return img.src.indexOf(encodeURIComponent(imgName)) !== -1;
            });

            if (filteredImgs.length > 1) {
                console.warn('More then one image is found with name: ' + imgName + '. Using first one');
            }

            var img = filteredImgs[0];
            img.classList.add(self.defaults.imgClass);

            var container = img.parentElement;
            container.classList.add(self.defaults.containerClass);

            return {
                imgClass: self.defaults.imgClass,
                containerClass: self.defaults.containerClass
            }
        },
        initPOI: function (opts, jsonData) {
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
        },
        destroyPOI: function () {
            $('.js-img-container').empty();
        },
        reapplyImg: function (defaults, opts) {
            $('.js-img-container').append('<img src="' + defaults.path + 'i/' +
                (opts ? opts.account : defaults.account) + '/' +
                (opts ? opts.imgName : defaults.imgName) + '" />');
        },
        getData: function (opts, callback) {
            var self = this;
            $.ajax({
                url: (opts.path || 'http://i1.adis.ws/') + 'i/' + opts.account + '/' + opts.imgName + '.js?v=' + new Date().getTime() + '&metadata=true',
                jsonp: "func",
                dataType: "jsonp",
                success: function (response) {
                    var resp = false;
                    if (!response || !response.metadata || !response.metadata.hotSpots || response.metadata.hotSpots.hotSpots.list.length < 1) {
                        resp = false;
                    }

                    else {
                        resp = response;
                    }

                    return callback.call(self, resp);
                },
                error: function () {
                    return callback.call(self, false);
                }
            });
        },

        //Panel behavior
        panelToggle: function ($panelNav, $panel, callback) {
            var self = this;
            $panelNav.click(function (e) {
                e.preventDefault();
                $panel.toggle();

                if (typeof callback === 'function') {
                    callback.call(self);
                }
            });
        },
        panelApply: function ($panelNav, $panel) {
            var self = this;
            var passed = true;
            var settings = {};
            $panel.find('input:text').each(function (ind, input) {
                var $input = $(input);

                var val = $input.val();
                var name = $input.prop('name');
                if (val.length < 1) {
                    passed = false;
                    alert('All fields are required');
                    return false;
                }

                settings[name] = val;
                self.generatedCode.defaults[name] = val;
            });

            if (!passed) {
                return false;
            }

            self.getData(settings, function (jsonData) {
                self.destroyPOI();

                if (!jsonData) {
                    $panelNav.addClass('with-error');
                    self.reapplyImg(self.defaults);
                    self.initPOI(self.defaults);
                }

                else {
                    $panelNav.removeClass('with-error');
                    self.reapplyImg(self.defaults, settings);
                    self.initPOI(settings, jsonData);
                }
            });
        },
        panelInit: function ($panelNav, $panel, $panelButton, $panneltoHide) {
            var self = this;
            self.panelToggle($panelNav, $panel, function(){
                $panneltoHide.hide();
            });

            $panelButton.click(function (e) {
                e.preventDefault();
                self.panelApply($panelNav, $panel);
            });

        },
        appendScriptStyles: function (callback) {
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
        },
        constructCopyCode: function ($textarea) {
            var self = this;

            self.generatedCode.findPOIClasses = self.findPOIClasses;
            self.generatedCode.appendScriptStyles = self.appendScriptStyles;
            self.generatedCode.initPOI = self.initPOI;

            var libCode = 'window.PoiLibCode={};';

            for (var x in self.defaults){
                if (self.defaults.hasOwnProperty(x)) {
                    if(x === 'jsonData' || typeof self.generatedCode.defaults[x] !== 'undefined'){
                        continue;
                    }
                    self.generatedCode.defaults[x] = self.defaults[x];
                }
            }

            for (var x in self.generatedCode) {
                if (self.generatedCode.hasOwnProperty(x)) {
                    if (typeof self.generatedCode[x] === 'function') {
                        libCode += 'window.PoiLibCode["' + x + '"] = ' + self.generatedCode[x] + ';';
                        continue;
                    }

                    libCode += 'window.PoiLibCode["' + x + '"] = ' + JSON.stringify(self.generatedCode[x]) + ';';
                }
            }

            libCode += 'window.PoiLibCode.appendScriptStyles(function(){window.PoiLibCode.initPOI(window.PoiLibCode.defaults);})';

            $textarea.val(libCode);
        },
        copyToClipboard: function ($codeCopyButton, $textarea) {
            $codeCopyButton.click(function (e) {
                e.preventDefault();
                $textarea.select();
                document.execCommand('copy');
            });
        },
        codeCopyInit: function ($codeNav, $codePanel, $codeCopyButton, $textarea, $panelToHide) {
            var self = this;

            self.panelToggle($codeNav, $codePanel, function () {
                $panelToHide.hide();
                self.constructCopyCode($textarea)
            });
            self.copyToClipboard($codeCopyButton, $textarea);
        },
        initAll: function () {
            var self = this;
            var $panelNav = $('.js_panel_nav');
            var $panel = $('.js_panel');
            var $panelButton = $('.js_panel_submit');

            var $codeNav = $('.js_code_nav');
            var $codePanel = $('.js_code_panel');
            var $codeCopyButton = $('.js_copy_clipboard');
            var $codeTextarea = $('.js_copy_textarea')

            self.getData(self.defaults, function (jsonData) {
                self.defaults.jsonData = jsonData
                self.initPOI(self.defaults);
            });
            self.panelInit($panelNav, $panel, $panelButton, $codePanel);
            self.codeCopyInit($codeNav, $codePanel, $codeCopyButton, $codeTextarea, $panel);
        }
    }
}(jQuery));