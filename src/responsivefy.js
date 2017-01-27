const d3 = require('d3')

export const responsivefy = (svg) => {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style('width'), 10),
        height = parseInt(svg.style('height'), 10),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('perserveAspectRatio', 'xMidYMid')
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on('resize.' + container.attr('id'), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style('width'), 10),
            targetHeight = parseInt(container.style('height'), 10);
        //svg.attr('width', targetWidth);
        svg.attr('height', targetHeight);
        //svg.attr('height', Math.round(targetWidth / aspect));
    }
}