var TestHelpers = {
    formatPosition: function (val) {
        var computedVal = val.toString();
        computedVal = computedVal.substr(0, 2) + computedVal.substr(2, 3);
        return computedVal;
    },
    convertPercent: function (val) {
        var computedVal = val.toString().slice(2);
        computedVal = computedVal.substr(0, 2) + '.' + computedVal.substr(2,2);
        return computedVal;
    },
    getPointsFromSVG: function(points){
        return points.split(' ');
    },
    transformPolygonPoints: function(points, imgInfo){
        var pointsCalc = '';
        points.forEach(function(v){
            pointsCalc += ((imgInfo.dimensions.width * v.x) + ',' + (imgInfo.dimensions.height * v.y) + ' ');
        });
        return pointsCalc;
    },
    checkHotspotRequiredData: function(hotspotData){
        if (
            (typeof hotspotData.$image === 'object') &&
            (typeof hotspotData.$parent === 'object') &&
            (typeof hotspotData.$target === 'object') &&
            (hotspotData.hotspot !== 'undefined') &&
            (hotspotData.hotspot.selector.length > 0) &&
            (hotspotData.hotspot.target.length > 0) &&
            (typeof hotspotData.hotspot.points.x === 'number') &&
            (typeof hotspotData.hotspot.points.y === 'number')

        ) {
            return true;
        }

        return false;
    },
    checkPolygonRequiredData: function(hotspotData){
        if (
            (typeof hotspotData.$image === 'object') &&
            (typeof hotspotData.$parent === 'object') &&
            (typeof hotspotData.$target === 'object') &&
            (hotspotData.polygon !== 'undefined') &&
            (hotspotData.polygon.selector.length > 0) &&
            (hotspotData.polygon.target.length > 0) &&
            (hotspotData.polygon.points.length === 4) &&
            (typeof hotspotData.polygon.points[0].x === 'number') &&
            (typeof hotspotData.polygon.points[0].y === 'number')

        ) {
            return true;
        }

        return false;
    }
}

if(typeof module !== 'undefined'){
    module.exports =  function(){
       return  TestHelpers;
    }
}