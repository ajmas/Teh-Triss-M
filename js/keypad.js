var Keypad = {

    model: undefined,

    drawHexagon: function (snap, x, y, width, height, opts) {

        var centerPoint = [(width / 2) + x, (height / 2) + y];
        var radius = Math.min(width, height) / 2;
        var points = [], steps = 6, shape, i, rotation = 0;

        if (opts && opts.inset) {
            radius -= opts.inset;
        }

        if (opts && opts.rotation) {
            rotation = opts.rotation;
        }

        for (i = 0; i < steps; i++) {
            points.push([(centerPoint[0] + radius * Math.cos((2 * Math.PI) * (i / steps) + rotation)), (centerPoint[1] + radius * Math.sin((2 * Math.PI) * (i / steps) + rotation))]);
        }
        points.push(points[0]);
        shape = snap.polyline(points).attr({
            fill: 'lightgrey',
            stroke: 'black',
            'class': 'button'
        });

        if (opts && opts.id && opts.id.trim().length > 0) {
            shape.attr('id', opts.id);
        }
    },

    drawKeypad: function (elementId) {

        var element, elementRef, snap, width, height, buttonOffsets, i;
        elementRef = '#' + elementId;
        element = $(elementRef);
        element.append('<svg width="' + element.width() + 'px" height="' + element.height() + 'px"/>');

        snap = Snap(elementRef + ' svg');
        //console.log(snap.getBBox());
        console.log('ddd', width, height);

        var x = 0, y = 0, idx = 0;
        var xOffset = 23;
        var scale = 2;
        var top = 10;
        var size = 50;
        var inset = 3

        size = size * scale;

        buttonOffsets = [
            [x + (23 * scale), 0 * scale],
            [x, 40 * scale, size],
            [x + (47 * scale), 40 * scale],
            [x + (23 * scale), 80 * scale],
            [x, 120 * scale],
            [x + (47 * scale), 120 * scale],
            [x + (23 * scale), 160 * scale]
            ];

        for (i=0; i< buttonOffsets.length; i++) {
            this.drawHexagon(snap, buttonOffsets[i][0], buttonOffsets[i][1], size, size, {
                inset: inset,
                rotation: Math.PI / 2,
                id: elementId + '-' + i
                });
        }
    },

    registerButton: function (elementRef, label, clickHandler) {

        $(elementRef).on('click', clickHandler);

        var element = Snap.select(elementRef);//'#' + elementId + '-1');
        var bbox = element.getBBox();
        var snap = element.paper;

        element = snap.text(bbox.x, bbox.y + bbox.height / 2, label);

        element.attr('x', bbox.x + ((bbox.width / 2) - element.getBBox().width / 2));


    },

    initialise: function (elementId, model) {
        this.drawKeypad(elementId);
        this.model = model;
    }

};
