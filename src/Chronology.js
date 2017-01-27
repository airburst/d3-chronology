const d3 = require('d3');
import { responsivefy } from './responsivefy';

export class Chronology {

    constructor(data, options) {
        this.data = data
        this.dates = data.map(d => d.date)
        this.handleOptions(options)
    }

    handleOptions(options) {
        this.fullWidth = (options.width) ? options.width : 800
        this.fullHeight = (options.height) ? options.height : 400
        this.margin = (options.margin) ? options.margin : { top: 0, right: 0, bottom: 0, left: 30 }
        this.width = this.fullWidth - this.margin.left - this.margin.right
        this.height = this.fullHeight - this.margin.top - this.margin.bottom
        this.start = (options.start) ? options.start : dateParse(d3.min(dates))
        this.end = (options.end) ? options.end : dateParse(d3.max(dates))
        this.fontSize = (options.fontSize) ? options.fontSize : '18px';
        this.axisColour = (options.axisColour) ? options.axisColour : '#262626'
        this.responsive = (options.responsive !== undefined) ? options.responsive : true
        this.dateParse = d3.timeParse('%Y-%m-%d');
        this.bar = { min: 2, max: 48 };
        this.barOffset = 10;
    }

    render() {
        this.canvas = this.createCanvas()
        this.createChart()
        this.prepareAxes()
        this.chart = this.createChronology()
        this.createAxes()
        // this.setZoom()
    }

    createCanvas() {
        let canvas = d3.select('.chart')
            .append('svg')
            .attr('id', 'chart')
            .attr('width', this.fullWidth)
            .attr('height', this.fullHeight)
        if (this.responsive) { canvas.call(responsivefy) }
        return canvas
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
    }

    createChart() {
        this.canvas.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('fill', 'none')
    }

    prepareAxes() {
        this.prepareXAxis()
        this.prepareYAxis()
    }

    prepareXAxis() {
        this.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.width])
    }

    prepareYAxis() {
        this.yScale = d3.scaleTime()
            //.domain(d3.extent(this.dates, d => this.dateParse(d)))
            .domain([this.start, this.end])
            .range([this.height, 0])
    }

    createAxes() {
        this.createYAxis()
        d3.selectAll('.domain').style('stroke', this.axisColour)
        d3.selectAll('.tick').selectAll('line').style('stroke', this.axisColour)
        d3.selectAll('.tick').selectAll('text').style('fill', this.axisColour)
    }

    createYAxis() {
        this.yAxis = d3.axisLeft(this.yScale)
        this.gY = this.canvas.append('g')
            .attr('class', 'yaxis')
            .style('font-size', this.fontSize)
            .call(this.yAxis)
    }

    createChronology() {
        let bar = this.setBars();
        return this.canvas.selectAll('dot')
            .data(this.data)
            // .enter().append("circle")
            //         .attr('class', 'datepoint')
            //         .attr("r", 5)
            //         .attr("cx", 0)
            //         .attr("cy", d => this.yScale(this.dateParse(d)))
            .enter().append('rect')
            .attr('class', 'chrono-bar')
            .attr('x', this.barOffset)
            .attr('y', d => this.yScale(this.dateParse(d.date)) * bar.scale)
            .attr('width', this.xScale(100) - this.barOffset)
            .attr('height', bar.height)
            .on('click', (d) => console.log(d))
    }

    setBars() {
        // Set bar height for one day on y (time) scale
        let min = this.dateParse(d3.min(this.dates)),
            max = this.dateParse(d3.max(this.dates)),
            days = (max.getTime() - min.getTime()) / 86400000,
            height = this.height / (days + 1);

        // Enforce min-max bar height
        height = (height < this.bar.min) ? this.bar.min : height;
        height = (height > this.bar.max) ? this.bar.max : height;
        let scale = this.height / (this.height + height);

        return {
            height: height,
            scale: scale
        }
    }

    // setZoom() {
    //     let eventLayer = this.canvas.append('rect')
    //         .attr('class', 'chrono-events')
    //         .attr('width', this.width)
    //         .attr('height', this.height)
    //         .on('mousemove', this.mouseOver.bind(this))

    //     this.zoomed = () => {
    //         let scale = d3.event.transform.k;
    //         this.chart.attr('transform', 'translate(0,' + d3.event.transform.y + ') scale(' + scale + ')');
    //         this.gY.call(this.yAxis.scale(d3.event.transform.rescaleY(this.yScale)));

    //         // Calculate bounds of current view and reset bar height and position
    //         let { k, x, y } = d3.zoomIdentity.translate(0, d3.event.transform.y).scale(scale);
    //         let max = this.yScale.invert(-y / k);
    //         let min = this.yScale.invert((this.height - y) / k);
    //         let bars = this.setBars(min, max);
    //         this.y = y;
    //         this.k = k;
    //         d3.selectAll('.chrono-bar')
    //             .attr('x', this.barOffset / k)
    //             // .attr('y', d => this.yScale(this.dateParse(d)) * bar.scale)
    //             .attr('width', (this.xScale(100) - this.barOffset) / k)
    //             .attr('height', bars.height / k)
    //     }

    //     let zoom = d3.zoom()
    //         .scaleExtent([1, 20])
    //         .translateExtent([[0, 0], [this.width, this.height]])
    //         .on('zoom', this.zoomed);

    //     eventLayer.call(zoom);
    // }

    // mouseOver() {
    //     let y = d3.mouse(d3.event.currentTarget)[1];
    //     let offset = this.y || 0;
    //     let scale = this.k || 1;
    //     let date = this.yScale.invert((y - offset) / scale);
    //     // this.findEvent(date);
    // }

    // findEvent(date) {
    //     let dates = this.data
    //         .map(d => d.date)
    //         .filter(m => {
    //             let diff = date.getTime() - this.dateParse(m).getTime()
    //             // console.log(diff, this.dateParse(m))
    //             return ((diff >= -86400000) && (diff <= 0));
    //         })

    //     let events = this.data.filter(d => d.date === dates[0])
    //     if (events.length > 0) { console.log(events) }
    // }

}
