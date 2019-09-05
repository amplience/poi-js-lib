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
                var canvas = imgInfo.layerCanvas || imgInfo.canvas;
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
};

