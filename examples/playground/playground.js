(function ($) {
    window.POIGenerator = {
        generatedCode: {
            defaults: {
                poiJsSrc: 'https://dev-solutions.s3.amazonaws.com/poi-js-lib/v2/poi-lib.min.js',
                poiCssSrc: 'https://dev-solutions.s3.amazonaws.com/poi-js-lib/v2/css/poi.css'
            },
            appendScriptStyles: null,
            findPOIClasses: null,
            initPOI: null
        },
        defaults: {
            account: 'csdemo',
            imgName: 'CB_DLP_201903_ColorLP_BlushRomance_Hero',
            imgClass: 'js-poi-img',
            containerClass: 'js-poi-img-container',
            basePath: 'https://www.crateandbarrel.com/',
            path: 'https://i1.adis.ws/',
            jsonData: null
        },
        findPOIClasses: function (imgName) {
            var self = this;

            function getChildren(elem, skipMe) {
                var r = [];
                for (; elem; elem = elem.nextSibling)
                    if (elem.nodeType == 1 && elem != skipMe)
                        r.push(elem);
                return r;
            }

            var imgs = Array.prototype.slice.call(document.querySelectorAll("img"));
            var filteredImgs = imgs.filter(function (img) {
                return img.src.indexOf(encodeURIComponent(imgName)) !== -1;
            });

            if (filteredImgs.length > 1) {
                console.warn('More then one image is found with name: ' + imgName + '. Using first one');
            }

            var img = filteredImgs[0];
            var pic = img;


            var container = img.parentNode;
            if (container.tagName.toLowerCase() === 'picture') {
                container = container.parentNode;
                pic = img.parentNode;
            }

            img.classList.add(self.defaults.imgClass);


            var siblings = getChildren(container.firstChild, pic);

            if (siblings.length > 0) {
                var $wrapper = document.createElement('div');
                pic.parentNode.insertBefore($wrapper, pic);
                $wrapper.appendChild(pic);
            }

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
                        data: jsonData ? jsonData.metadata : (self.defaults.metadata || false),
                        polygonCallbacks: [
                            {
                                target: "*",
                                action: "click",
                                callback: function (evt, settings) {
                                    window.open(
                                        opts.basePath + settings.polygon.target,
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
            $('.js-img-container').find('svg').each(function () {
                $(this).remove();
            })
        },
        reapplyImg: function (defaults, opts) {
            var $sources = document.getElementsByTagName('source');
            var $img = document.getElementsByTagName('img');
            $sources = Array.from($sources);

            $sources = $sources.concat($img && $img[0]);

            $img && $img[0] && $img[0].setAttribute('src', defaults.path + 'i/' +
                (opts ? opts.account : defaults.account) + '/' +
                (opts ? opts.imgName : defaults.imgName));

            $sources.forEach(function (el) {
                var set = el && el.getAttribute('srcset');
                set = set.split(',');

                set = set.map(function (el) {
                    var paths = el.split('?');

                    paths[0] = defaults.path + 'i/' +
                        (opts ? opts.account : defaults.account) + '/' +
                        (opts ? opts.imgName : defaults.imgName);

                    if (paths[1]) {
                        paths[1] = paths[1].replace(defaults.imgName, opts.imgName)
                    }

                    el = paths.join('?');

                    return el;
                });

                set = set.join(', ');

                el.setAttribute('srcset', set)
            });
        },
        /*  getData: function (opts, callback) {
              var self = this;
              var queryStr = opts.query || '';
              var query = opts.imgName.includes('?') ? '&X-Amp-Trace=true&v=' + new Date().getTime() : '?' + queryStr + '&X-Amp-Trace=true&v=' + new Date().getTime();

              $.ajax({
                  url: (opts.path || 'http://i1.adis.ws/') + 'i/' + opts.account + '/' + opts.imgName + query,
                  success: function (response) {
                      var translate = response.find(function (el) {
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

                      return callback.call(self, {
                          metadata: metadata,
                          canvas: canvas,
                          layerCommand: layerCommand
                      });
                  },
                  error: function () {
                      return callback.call(self, false);
                  }
              });
          },*/

        //Panel behavior
        panelToggle: function ($panelNav, $panel, callback) {
            var self = this;
            $panelNav.click(function (e) {
                e.preventDefault();
                $panel.toggle();
                $panelNav.toggleClass('active');

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

            //self.getData(settings, function (jsonData) {
            self.destroyPOI();
            $panelNav.removeClass('with-error');
            self.reapplyImg(self.defaults, settings);
            self.initPOI(settings);

            var $picker = document.getElementById("colorPicker");
            var picker = tinycolorpicker($picker);
            picker.setColor('#ececec');

            Object.assign(self.defaults, settings)
            // });
        },
        panelInit: function ($panelNav, $panel, $panelButton, $panneltoHide, $panelDocs, $panelDocsContainer, $codeNav) {
            var self = this;
            self.panelToggle($panelNav, $panel, function () {
                $panneltoHide.hide();
                $panelDocsContainer.hide();
                $panelDocs.removeClass('active');
                $codeNav.removeClass('active');
            });

            self.panelToggle($panelDocs, $panelDocsContainer, function () {
                $panneltoHide.hide();
                $panel.hide();
                $panelNav.removeClass('active');
                $codeNav.removeClass('active');
            });

            $panelButton.click(function (e) {
                e.preventDefault();
                self.panelApply($panelNav, $panel);
            });

        },
        appendScriptStyles: function (callback) {
            var self = this;

            var style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("type", "text/css");
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

            for (var x in self.defaults) {
                if (self.defaults.hasOwnProperty(x)) {
                    if (x === 'jsonData' || typeof self.generatedCode.defaults[x] !== 'undefined') {
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
        codeCopyInit: function ($codeNav, $codePanel, $codeCopyButton, $textarea, $panelToHide, $panelDocsContainer, $panelDocs, $panelNav) {
            var self = this;

            self.panelToggle($codeNav, $codePanel, function () {
                $panelToHide.hide();
                $panelDocsContainer.hide();
                $panelDocs.removeClass('active');
                $panelNav.removeClass('active');
                self.constructCopyCode($textarea)
            });
            self.copyToClipboard($codeCopyButton, $textarea);
        },
        initAll: function () {
            var self = this;
            var $panelNav = $('.js_panel_nav');
            var $panel = $('.js_panel');
            var $panelButton = $('.js_panel_submit');
            var $panelCancelButton = $('.js_panel_submit_cancel');
            var $panelDocs = $('.js_docs');

            var $codeNav = $('.js_code_nav');
            var $codePanel = $('.js_code_panel');
            var $codeCopyButton = $('.js_copy_clipboard');
            var $codeTextarea = $('.js_copy_textarea');
            var $panelDocsContainer = $('.code-docs-panel');
            var $imgWrapper = $('.img-wrapper');

            self.initPOI(self.defaults);

            $panelCancelButton.on('click', function (e) {
                e.preventDefault();
                $panel.toggle();
                $panelNav.removeClass('active');
            });

            $imgWrapper.on('click', function (e) {
                e.preventDefault();
                $panel.hide();
                $codePanel.hide();
                $panelDocsContainer.hide();
                $panelNav.removeClass('active');
                $codeNav.removeClass('active');
                $panelDocs.removeClass('active');
            });

            /* self.getData(self.defaults, function (jsonData) {
                 if (jsonData.metadata) {
                     self.defaults.jsonData = jsonData.metadata;
                 }
                 if (jsonData.canvas) {
                     self.defaults.canvas = jsonData.canvas;
                 }
                 if (jsonData.layerCommand) {
                     self.defaults.layerCommand = jsonData.layerCommand;
                 }
                 self.initPOI(self.defaults);
             });*/
            self.panelInit($panelNav, $panel, $panelButton, $codePanel, $panelDocs, $panelDocsContainer, $codeNav);
            self.codeCopyInit($codeNav, $codePanel, $codeCopyButton, $codeTextarea, $panel, $panelDocsContainer, $panelDocs, $panelNav);
        }
    }
}(jQuery));