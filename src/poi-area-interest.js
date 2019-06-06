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
            var canvas = imgInfo.canvas;
            var isX = false;
            var isY = false;
            var newX;
            var newY;

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

                point.points.forEach(function (v, ind) {
                    var x = imgInfo.dimensions.width * v.x;
                    var y = imgInfo.dimensions.height * v.y;
                    if (canvas) {
                        x = Math.abs(canvasX - x);
                        y = Math.abs(canvasY - y);
                    }
                    pointsCalc += (x + ',' + y + ' ');
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
            var otherAreas = $parent && $parent.getElementsByTagName('svg');

            if (!otherAreas || !otherAreas.length) {
                return false;
            }

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

