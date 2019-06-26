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

                    if (x > canvasW || x > imgInfo.dimensions.width || y > canvasH || y > imgInfo.dimensions.height) {
                        needRender = false;
                    }

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
                if (otherPolygons[i].getAttribute('data-name') === imgInfo.name) {
                    otherPolygons[i].style.display = 'block';
                } else {
                    otherPolygons[i].style.display = 'none';
                }
            }
        }
    };

    return methods;
};

