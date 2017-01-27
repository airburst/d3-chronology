import * as d3 from 'd3';
import { textwrap } from 'd3-textwrap';
import moment from 'moment';
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
        this.detailsWidth = 400;
    }

    render() {
        this.removeDetailsPanel();
        this.canvas = this.createCanvas()
        this.createChart()
        this.prepareAxes()
        this.drawChronology()
        this.createAxes()
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

    drawChronology() {
        let bar = this.setBars();

        // Markers on time scale
        // this.canvas.selectAll('dot')
        //     .data(this.data)
        //     .enter().append("circle")
        //             .attr('class', 'datepoint')
        //             .attr("r", 5)
        //             .attr("cx", 0)
        //             .attr("cy", d => this.yScale(this.dateParse(d.date)) * bar.scale)

        // Event bars
        let selection = this.canvas.selectAll('bar').data(this.data).enter().append('g');
        
        selection.append('rect')
            .attr('class', 'chrono-bar')
            .attr('x', this.barOffset)
            .attr('y', d => this.yScale(this.dateParse(d.date)) * bar.scale)
            .attr('width', this.xScale(100) - this.barOffset)
            .attr('height', bar.height)
            .on('click', (d, i, y) => this.toggleEvent(d, i, this.yScale(this.dateParse(d.date)) * bar.scale))

        // selection.append('rect')
        //     .attr('class', 'event-details')
        //     .attr('x', this.width - this.detailsWidth)
        //     .attr('y', d => this.yScale(this.dateParse(d.date)) * bar.scale)
        //     .attr('width', this.detailsWidth)
        //     .attr('height', 300)                        // Should be computed from text size
        //     // .on('click', this.removeDetailsPanels.bind(this))
        // selection.append('text')
        //     .attr('class', 'event-date')
        //     .attr('x', this.width - this.detailsWidth + 5)
        //     .attr('y', d => this.yScale(this.dateParse(d.date)) * bar.scale + 20)
        //     .text(d => this.formatDate(d.date))

        // selection.append('text')
        //     .attr('class', 'event-text')
        //     .attr('x', this.width - this.detailsWidth + 5)
        //     .attr('y', d => this.yScale(this.dateParse(d.date)) * bar.scale + 50)
        //     .attr('width', 200)
        //     .text(d => d.body)

        // let bounds = d3.selectAll('.event-details');
        // console.log(bounds)
        // // bounds.forEach(b => {
        // //     // let wrap = textwrap().bounds(b.node());
        // //     // d3.selectAll('.event-text').call(wrap);
        // // })        
    }

    setBars() {
        // Set bar height for one day on y (time) scale
        let min = this.start,
            max = this.end,
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

    toggleEvent(details, index, y) {
        let date = this.formatDate(details.date);
        this.selectBar(index);
        this.removeDetailsPanel();

        // Draw the new details pane
        let container = document.querySelector('.event-container'),
            title = document.createTextNode(date),
            titleDiv = document.createElement('div'),
            text = document.createTextNode(details.body),
            textDiv = document.createElement('div');
        titleDiv.appendChild(title);
        titleDiv.className = 'event-title';
        textDiv.appendChild(text);
        textDiv.className = 'event-text';
        container.appendChild(titleDiv);
        container.appendChild(textDiv);
        container.style.top = y + 10 + 'px';
        container.style.width = this.detailsWidth + this.margin.left + 'px';
        container.style.left = this.width - this.detailsWidth + 'px';
        container.addEventListener('click', this.removeDetailsPanel)

        // this.canvas.append('rect')
        //     .attr('class', 'event-details')
        //     .attr('x', this.width - this.detailsWidth)
        //     .attr('y', y)
        //     .attr('width', this.detailsWidth)
        //     .attr('height', 300)                        // Should be computed from text size
        //     .on('click', this.removeDetailsPanels.bind(this))
        //     .append('g')
        //         .attr('x', this.width - this.detailsWidth)
        //         .attr('y', y)
        //         .append('text')

    }

    formatDate(date) {
        let d = moment(date, 'YYYY-MM-DD');
        return moment(d).format('DD MMM YYYY');
    }

    fitText(text, width, height) {

    }

    selectBar(index) {
        d3.selectAll('.chrono-bar')
            .filter((d, i) => { return i === index })
            .attr('class', 'chrono-bar selected')
    }

    removeDetailsPanel() {
        document.querySelector('.event-container').innerHTML = '';
    }

}
