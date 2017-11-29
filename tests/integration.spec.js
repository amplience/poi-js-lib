var expectedData = require('./expectedData');
var deepEqual = require('deep-equal');
var helpers = require('./helpers')();

var data;
var hotspot;
var polygon;

delete expectedData.points[0].points.client;


module.exports = {
    'Hotspot tests': function (browser) {
        browser.url('http://localhost:8000/examples/test.html')
            .waitForElementPresent('.img-point', 3000)

            .execute('return window.test', [], function (response) {
                data = response.value.data;
                hotspot = response.value.hotspot;
                polygon = response.value.polygon
                this.assert.ok(deepEqual(data.imgInfo.points, expectedData.points), "Returned POI data equals to expected data");
            })

            .execute([], function (res) {
                var hotspotLeftPosition = helpers.convertPercent(data.imgInfo.points[0].points.x);
                var hotspotRightPosition = helpers.convertPercent(data.imgInfo.points[0].points.y);
                this.assert.ok(
                    (hotspotLeftPosition === hotspot.position.left && hotspotRightPosition === hotspot.position.top),
                    "Hotspot has correct left and top positions"
                );
            })

            .execute([], function (res) {
                browser
                    .execute([], function (response) {
                        this.assert.ok(hotspot.initCallbackData !== null, "Hotspot init callback is called");
                    })
                    .execute([], function (response) {
                        var checkValues = helpers.checkHotspotRequiredData(hotspot.initCallbackData);
                        this.assert.ok(checkValues == true, "Hotspot Init callback is called with required data");
                    })
                    .click('.img-point[data-target="rightLeg"]')

                    .execute('return window.test', [], function (response) {
                        hotspot = response.value.hotspot;
                        this.assert.ok(hotspot.clickCallback !== null, "Hotspot callback on click action is called");
                    })
                    .execute([], function (response) {
                        var checkValues = helpers.checkHotspotRequiredData(hotspot.clickCallbackData);
                        this.assert.ok(checkValues == true, "Hotspot Click callback is called with required data");
                    })
            })
    },
    'Area of Interest tests': function (browser) {
        browser
            .execute([], function (res) {
                var points = polygon.points;
                this.assert.ok(points.split(' ').length === 4, "Square has 4 points");
            })

            .execute([], function (res) {
                var transformPoints = helpers.transformAreaPoints(polygon.rawPoints, data.imgInfo).trim();
                this.assert.ok(polygon.points === transformPoints, "Square is positioned correctly");
            })

            .execute([], function (response) {

                browser
                    .execute([], function (response) {
                        this.assert.ok(polygon.initCallbackData !== null, "Square init callback is called");
                    })
                    .execute([], function (response) {
                        var checkValues = helpers.checkPolygonRequiredData(polygon.initCallbackData);
                        this.assert.ok(checkValues == true, "Square Init callback is called with required data");
                    })
                    .click('.img-area')
                    .execute('return window.test', [], function (response) {
                        polygon = response.value.polygon;
                        this.assert.ok(polygon.clickCallback !== null, "Square callback on click action is called");
                    })
                    .execute([], function (response) {
                        var checkValues = helpers.checkPolygonRequiredData(polygon.clickCallbackData);
                        this.assert.ok(checkValues == true, "Square Click callback is called with required data");
                    })
            })
        .end();
    },

}
