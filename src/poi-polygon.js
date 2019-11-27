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

