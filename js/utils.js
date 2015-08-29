var utils = {
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    radToDeg: function(rad) {
        return rad * 180 / Math.PI;
    },
    random: function(a, b)
    {
        return a + (b - a) * Math.random();
    }
}
