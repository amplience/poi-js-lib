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
            }

            else if (selector.indexOf('#') === 0) {
                selector = selector.slice(1);
                $elem.setAttribute('id', selector);
            }
            else {
                $elem.setAttribute('class', selector);
            }

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

