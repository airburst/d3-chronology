import moment from 'moment';
const d3 = require('d3');
import noUiSlider from 'nouislider';
import { Chronology } from './Chronology.js';
import timelineData from '../data/timelineData.json';

let dates = timelineData.map(d => d.date)
let dateParse = d3.timeParse('%Y-%m-%d')
let min = dateParse(d3.min(dates)).getTime()
let max = dateParse(d3.max(dates)).getTime()
let start = new Date(min), end = new Date(max)

const drawSlider = () => {
    let slider = document.getElementById('slider');

    noUiSlider.create(slider, {
        start: [min, max],
        orientation: 'vertical',
        direction: 'rtl',
        connect: true,
        behaviour: 'drag',
        range: {
            'min': [min],
            'max': [max]
        }
    });

    var dateValues = [
        document.getElementById('event-start'),
        document.getElementById('event-end')
    ];

    slider.noUiSlider.on('update', (values, handle) => {
        if (handle === 0) { start = new Date(+values[0]); }
        if (handle === 1) { end = new Date(+values[1]); }
        drawChart();
    });
}

const drawChart = () => {
    if (document.getElementById('chart') !== null) { document.getElementById('chart').remove() }

    const chronology = new Chronology(timelineData, {
        width: 800,
        height: 1000,
        margin: { top: 10, right: 10, bottom: 0, left: 80 },
        start: start,
        end: end,
        responsive: false,
        axisColour: '#464646'
    });

    chronology.render();
}

drawSlider();
drawChart();