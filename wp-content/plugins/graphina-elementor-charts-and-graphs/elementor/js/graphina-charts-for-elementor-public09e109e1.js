(function($) {
    'use strict';

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    $(window).on('load', function () {
        let ele = $('.chart-card');
        addRemoveClass(ele.find('h4'), 'graphina-chart-heading');
        addRemoveClass(ele.find('p'), 'graphina-chart-sub-heading');
    });


    // Graphina Feature Request For Elementor Panel
    document.addEventListener('DOMContentLoaded', function() {
        if (parent.document.querySelector('.elementor-editor-active') !== null) {
            let _graphina_get_help = '';
            let _graphina_get_help_url = "https://iqonic.design/feature-request/?for_product=graphina";
            setInterval(function() {
                if (parent.document.querySelector('[class*=elementor-control-iq]') != null) {
                    _graphina_get_help = parent.document.querySelector('#elementor-panel__editor__help__link');
                    if (_graphina_get_help != null) {
                        if (_graphina_get_help.getAttribute("href") !== _graphina_get_help_url) {
                            _graphina_get_help.setAttribute("href", _graphina_get_help_url);
                            _graphina_get_help.innerHTML = "<b> Graphina Feature Request <i class='eicon-editor-external-link'></i> </b>";
                        }
                    }
                }
            }, 3000)
        }
    });

})(jQuery);


/***********************
 * Variables
 */
if (typeof fadein == "undefined") {
    var fadein = {};
}
if (typeof fadeout == "undefined") {
    var fadeout = {};
}
if (typeof isInit == "undefined") {
    var isInit = {};
}

const googleChartList = ['area_google','bar_google','column_google','line_google','pie_google','donut_google','gauge_google','geo_google','org_google'];

const manualChartList = ['mixed','brush','gantt_google'];

function graphinNumberWithCommas(x, separator, decimal = -1) {
    if (isNaN(x)) {
        return x;
    }
    var parts = x.toString().split(".");
    let val = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    if (parts[1]) {
        if (decimal === -1) {
            val = val + '.' + parts[1]
        }else if (decimal !== 0) {
            val = val + '.' + parts[1].substring(0, decimal)
        }
    }

    return val;
}

function resetGraphinaVars() {
    if (typeof graphina_localize.graphinaAllGraphs == "undefined") {
        graphina_localize.graphinaAllGraphs = {};
    }
    if (typeof graphina_localize.graphinaAllGraphsOptions == "undefined") {
        graphina_localize.graphinaAllGraphsOptions = {};
    }
    if (typeof graphina_localize.graphinaBlockCharts == "undefined") {
        graphina_localize.graphinaBlockCharts = {};
    }
}
resetGraphinaVars();

/***************
 * Jquery Base
 * @param ele
 * @param add
 * @param remove
 */

function addRemoveClass(ele, add = '', remove = '') {
    if (remove !== '' && ele.hasClass(add)) ele.removeClass(remove);
    if (add !== '' && !ele.hasClass(add)) ele.addClass(add);
}

/************
 *
 * @param timestamp
 * @param isTime
 * @param isDate
 * @returns {string}
 */

function dateFormat(timestamp, isTime = false, isDate = false) {
    let dateSeparator = '-';
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear()
    return (isDate ? (day + dateSeparator + month + dateSeparator + year) : '') + (isDate && isTime ? ' ' : '') + (isTime ? (hours + ':' + minutes.substr(-2)) : '');
}

/********************
 *
 * @param date1
 * @param date2
 * @returns {string}
 */
function timeDifference(date1, date2) {
    let difference = new Date(date2).getTime() - new Date(date1).getTime();

    let daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24

    let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60

    let minutesDifference = Math.floor(difference / 1000 / 60);

    return getPostfix(daysDifference, 'day', 'days') +
        (daysDifference > 0 && hoursDifference > 0 ? ' ' : '') +
        getPostfix(hoursDifference, 'hour', 'hours') +
        (hoursDifference > 0 && minutesDifference > 0 ? ' ' : '') +
        getPostfix(minutesDifference, 'minute', 'minutes');
}

/*********************
 *
 * @param value
 * @param postfix1
 * @param postfix2
 * @returns {string}
 */
function getPostfix(value, postfix1, postfix2) {
    let result = ''
    switch (true) {
        case value === 0:
            break;
        case value === 1:
            result += value + ' ' + postfix1;
            break;
        case value > 1:
            result += value + ' ' + postfix2;
            break;
    }
    return result;
}

function isInViewport(el) {
    if (graphina_localize.is_view_port_disable != undefined && graphina_localize.is_view_port_disable == 'on') {
        return true;
    }
    const rect = el.getBoundingClientRect();
    return (
        (
            (rect.top - ((window.innerHeight || document.documentElement.clientHeight) / 2.1)) >= 0 &&
            (rect.bottom - ((window.innerHeight || document.documentElement.clientHeight) / 1.9)) <= (window.innerHeight || document.documentElement.clientHeight)
        ) ||
        (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        )
    );
}

function initNowGraphina(myElement, chart, id) {
    resetGraphinaVars();
    if (id in graphina_localize.graphinaAllGraphs) {
        graphina_localize.graphinaAllGraphs[id].destroy();
        delete graphina_localize.graphinaAllGraphs[id];
        delete graphina_localize.graphinaBlockCharts[id];
    }
    graphina_localize.graphinaAllGraphsOptions[id] = chart;
    isInit[id] = false;
    getChart(graphina_localize.graphinaAllGraphsOptions[id].ele, id);
}

function getChart(myElement, id) {
    if (typeof ApexCharts == 'function' && myElement !== null &&
        (id in isInit) && isInit[id] === false) {
        if ((graphina_localize.is_view_port_disable != undefined && graphina_localize.is_view_port_disable == 'on') || (graphina_localize.graphinaAllGraphsOptions[id].type !== undefined && graphina_localize.graphinaAllGraphsOptions[id].type === 'brush')) {
            initGraphinaCharts(id);
        } else {
            const observer = new IntersectionObserver(enteries => {
                enteries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (isInit[id] === false) {
                            initGraphinaCharts(id);
                        }
                    }
                })
            })
            observer.observe(myElement);
        }
    }
}

function initGraphinaCharts(id, type = 'area') {
    if (Object.keys(graphina_localize.graphinaBlockCharts).includes(id)) {
        if(!googleChartList.includes(type)){
            if (isInit[id] === true) {
                graphina_localize.graphinaAllGraphs[id].destroy();
            }
        }
        graphina_localize.graphinaAllGraphsOptions[id].ele.innerHTML = '';
        graphina_localize.graphinaAllGraphsOptions[id].ele.innerHTML = graphina_localize.graphinaBlockCharts[id];
    } else {
        if (isInit[id] === true || graphina_localize.graphinaAllGraphs[id]) {
            if(googleChartList.includes(type)){
                graphina_localize.graphinaAllGraphs[id].draw(graphina_localize.graphinaAllGraphsOptions[id].series,graphina_localize.graphinaAllGraphsOptions[id].options);
            }else{
                let option = graphina_localize.graphinaAllGraphsOptions[id].options;
                let series = option.series;
                // delete option.series;
                if (type === 'mixed') {
                    graphina_localize.graphinaAllGraphs[id].updateOptions({
                        series: option.series,
                        labels: graphina_localize.graphinaAllGraphsOptions[id].options.category
                    });
                } else {
                    graphina_localize.graphinaAllGraphs[id].updateOptions(option, true, graphina_localize.graphinaAllGraphsOptions[id].animation);
                    graphina_localize.graphinaAllGraphs[id].updateSeries(series, graphina_localize.graphinaAllGraphsOptions[id].animation);
                }
            }
        } else {
            if(googleChartList.includes(type)){
                graphinaGoogleChartRender(id,type)
            }else{
                instantInitGraphinaCharts(id,type);
            }
        }
    }
}

function updateGoogleChartType(defaultType, select, id) {
    if (graphina_localize.graphinaAllGraphsOptions[id]) {
        let selectType = select.value;
        graphina_localize.graphinaAllGraphsOptions[id].renderType = selectType;
        graphinaGoogleChartRender(id, selectType)
    }
}

function updateChartType(defaultvalue, select, id) {
    var x = select.value;
    if (defaultvalue == x) {
        graphina_localize.graphinaAllGraphs[id].updateOptions(graphina_localize.graphinaAllGraphsOptions[id].options);
        return;
    }
    if (x == 'area') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            fill: {
                opacity: 0.4,
                pattern: {
                    width: 6,
                    height: 6,
                    strokeWidth: 2
                }
            },
            dataLabels: {
                offsetY: 0,
                offsetX: 0
            },
            stroke: {
                show: true,
                colors: graphina_localize.graphinaAllGraphsOptions[id].options.colors,
                width: 2
            }
        })
    } else if (x == 'line') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            dataLabels: {
                offsetY: 0,
                offsetX: 0
            },
            stroke: {
                show: true,
                colors: graphina_localize.graphinaAllGraphsOptions[id].options.colors,
                width: 5
            }
        })
    } else if (x == 'bar') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            fill: {
                opacity: 0.9,
            },
            stroke: {
                show: true,
                width: 2,
                // colors: ['transparent']
            }
        })
    } else if (x == 'pie' || x == 'donut') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            fill: {
                opacity: 1,
            },
        })
    } else if (x == 'polarArea') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            fill: {
                opacity: 0.4,
            },
            stroke: {
                show: true,
                width: 2,
                colors: graphina_localize.graphinaAllGraphsOptions[id].options.colors,
            },
        })
    } else if (x == 'scatter') {
        graphina_localize.graphinaAllGraphs[id].updateOptions({
            chart: {
                type: x
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            fill: {
                opacity: 1
            },
            markers: {
                size: 10,
            }
        })

    }
}

function chartDatalabelsFormat(option, showlabel, showValue, numberformat, prefix, postfix, valueInStringShow, valueInString,forminatorPercentage=false,forminatorDecimal=0) {

    if (showlabel == 'yes' && showValue == 'yes') {
        return option.dataLabels.formatter = function(val, opt) {
            let seriesValue = opt.w.config.series[opt.seriesIndex];
            if (numberformat == "yes") {
                seriesValue = graphinNumberWithCommas(seriesValue,graphina_localize.thousand_seperator)
            } else {
                seriesValue = valueInStringShow == 'no' ? seriesValue : graphinaAbbrNum(seriesValue, valueInString);
            }
            if(forminatorPercentage){
                let totals = opt.w.globals.seriesTotals.reduce((a, b) => {
                    return  a + b;
                }, 0)
                if(postfix.trim() === ''){
                    postfix = '%';
                }
                seriesValue =  parseFloat(seriesValue/totals * 100).toFixed(parseInt(forminatorDecimal)) +postfix
                postfix = '';
            }
            return prefix + opt.w.config.labels[opt.seriesIndex] + '-' + seriesValue + postfix
        }
    } else if (showlabel == 'yes') {
        return option.dataLabels.formatter = function(val, opt) {
            if(forminatorPercentage){
                let totals = opt.w.globals.seriesTotals.reduce((a, b) => {
                    return  a + b;
                }, 0)
                if(postfix.trim() === ''){
                    postfix = '%';
                }
                val =  parseFloat(val/totals * 100).toFixed(parseInt(forminatorDecimal)) +postfix
                postfix = '';
            }
            return prefix + opt.w.config.labels[opt.seriesIndex] + '-' + parseFloat(val).toFixed(1) + postfix
        }
    } else if (showValue == 'yes') {
        return option.dataLabels.formatter = function(val, opt) {
            let seriesValue = opt.w.config.series[opt.seriesIndex];
            if (numberformat == "yes") {
                seriesValue = graphinNumberWithCommas(seriesValue,graphina_localize.thousand_seperator)
            } else {
                seriesValue = valueInStringShow == 'no' ? seriesValue : graphinaAbbrNum(seriesValue, valueInString);
            }
            if(forminatorPercentage){
                let totals = opt.w.globals.seriesTotals.reduce((a, b) => {
                    return  a + b;
                }, 0)
                if(postfix.trim() === ''){
                    postfix = '%';
                }
                seriesValue =  parseFloat(seriesValue/totals * 100).toFixed(parseInt(forminatorDecimal)) +postfix
                postfix = '';
            }
            return prefix + seriesValue + postfix
        }
    } else {
        return option.dataLabels.formatter = function(val, opt) {
            if(forminatorPercentage){
                let totals = opt.w.globals.seriesTotals.reduce((a, b) => {
                    return  a + b;
                }, 0)
                if(postfix.trim() === ''){
                    postfix = '%';
                }
                val =  parseFloat(val/totals * 100).toFixed(parseInt(forminatorDecimal)) +postfix
                postfix = '';
            }
            return prefix + parseFloat(val).toFixed(1) + postfix;
        }
    }

}

function axisTitle(option, type, title, style, xaxisYoffset = 0) {
    return option[type]['title'] = {
        text: title,
        offsetX: 0,
        offsetY: type === 'xaxis' ? xaxisYoffset : 0,
        style,
    }
}


function instantInitGraphinaCharts(id,type) {
    graphina_localize.graphinaAllGraphs[id] = new ApexCharts(graphina_localize.graphinaAllGraphsOptions[id].ele, graphina_localize.graphinaAllGraphsOptions[id].options);
    graphina_localize.graphinaAllGraphs[id].render();
    isInit[id] = true;
    // window.wp.hooks.doAction('graphina_apex_chart_render', type,id);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, {
                        [key]: {}
                    });
                    mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, {
                        [key]: source[key]
                    });
                }
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function chunk(array, size) {
    if (!array) return [];
    const firstChunk = array.slice(0, size);
    if (!firstChunk.length) {
        return array;
    }
    return [firstChunk].concat(chunk(array.slice(size, array.length), size));
}

function graphinaAbbrNum(number, decPlaces) {
    if (number === undefined || number == null) {
        return number;
    }
    var negativesign = '';
    if (number < 0) {
        negativesign = '-';
        number = Math.abs(number)
    }
    if(number < 1000){
        return negativesign + parseFloat(number).toFixed(decPlaces)
    }
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10, decPlaces);

    // Enumerate number abbreviations
    var abbrev = ["k", "m", "b", "t"];

    // Go through the array backwards, so we do the largest first
    for (var i = abbrev.length - 1; i >= 0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10, (i + 1) * 3);

        // If the number is bigger or equal do the abbreviation
        if (size <= number) {
            // Here, we multiply by decPlaces, round, and then divide by decPlaces.
            // This gives us nice rounding to a particular decimal place.
            number = Math.round(number * decPlaces / size) / decPlaces;

            // Handle special case where we round up to the next abbreviation
            if ((number == 1000) && (i < abbrev.length - 1)) {
                number = 1;
                i++;
            }

            // Add the letter for the abbreviation
            number += abbrev[i];

            // We are done... stop
            break;
        }
    }

    return negativesign + number;
}

function getDataForChartsAjax(request_fields, type, id, selected_field = '',button_filter_value='') {

    if (jQuery('body').hasClass("elementor-editor-active")) {
        let element_x = parent.document.querySelector('[data-setting="iq_' + type + '_chart_sql_builder_x_columns"]');
        let element_y = parent.document.querySelector('[data-setting="iq_' + type + '_chart_sql_builder_y_columns"]');
        if (element_x !== null && element_y !== null) {
            element_x.innerHTML = '';
            element_y.innerHTML = '';
        }

        let element_a = parent.document.querySelector('[data-setting="iq_' + type + '_chart_csv_x_columns"]');
        let element_b = parent.document.querySelector('[data-setting="iq_' + type + '_chart_csv_y_columns"]');
        if (element_a !== null && element_b !== null) {
            element_a.innerHTML = '';
            element_b.innerHTML = '';
        }
    };

    if (request_fields['iq_' + type + '_chart_filter_enable'] != undefined && request_fields['iq_' + type + '_chart_filter_enable'] == 'yes') {
        selected_field = graphinaGetSelectOptionValue(id);
    }

    jQuery.ajax({
        url: graphina_localize.ajaxurl,
        type: "post",
        dataType: "json",
        data: {
            action: "get_graphina_chart_settings",
            selected_field: selected_field,
            button_filter_value:button_filter_value,
            chart_type: type,
            chart_id: id,
            fields: request_fields
        },
        success: function(response) {
            if (document.getElementsByClassName(type + '-chart-' + id).length === 0) {
                return 0;
            }
            if (response.status === true && response.category_count > 0) {
                jQuery(document).find('.' + type + '-chart-' + id + '-loader').addClass('d-none');
                jQuery(document).find('.' + type + '-chart-' + id).removeClass('d-none');
                jQuery(document).find('.' + type + '-chart-' + id).parents('.chart-box').removeClass('d-none')
            } else {
                if(!(['heatmap', 'candle', 'bubble', 'timeline'].includes(type))){
                    jQuery(document).find('.' + type + '-chart-' + id).parents('.chart-box').addClass('d-none')
                    jQuery(document).find('.' + type + '-chart-' + id).addClass('d-none')
                    jQuery(document).find('.' + type + '-chart-' + id + '-loader').find('img').addClass('d-none');
                    jQuery(document).find('.' + type + '-chart-' + id + '-loader').removeClass('d-none');
                    jQuery(document).find('.' + type + '-chart-' + id + '-loader').find('p').removeClass('d-none');
                    if(!jQuery('body').hasClass("elementor-editor-active")){
                        return;
                    }
                }
            }
            if (response.status === true) {
                if (response.fail === true) {
                    graphina_localize.graphinaBlockCharts[response.chart_id] = response.fail_message;
                    initGraphinaCharts(response.chart_id);
                } else {
                    if(googleChartList.includes(type)){
                        if(!['pie_google','donut_google','gauge_google','geo_google','org_google'].includes(type)){
                            let column = graphina_localize.graphinaAllGraphsOptions[id].series.getNumberOfColumns()
                            if(column > 0 ){
                                graphina_localize.graphinaAllGraphsOptions[id].series.removeColumns(0,column)
                            }
                            graphina_localize.graphinaAllGraphsOptions[id].series.addColumn('string',response.googlechartData.title);
                            response.googlechartData.title_array.map((value,key)=>{
                                graphina_localize.graphinaAllGraphsOptions[id].series.addColumn('number',value);
                                if(response.googlechartData.annotation_show === 'yes'){
                                    graphina_localize.graphinaAllGraphsOptions[id].series.addColumn( { role: 'annotation' });
                                }
                            })
                        }
                        let row = graphina_localize.graphinaAllGraphsOptions[id].series.getNumberOfRows();
                        if(row > 0){
                            graphina_localize.graphinaAllGraphsOptions[id].series.removeRows(0,row)
                        }
                        graphina_localize.graphinaAllGraphsOptions[id].series.addRows(response.googlechartData.data)
                        if(['pie_google','donut_google','gauge_google'].includes(type)){
                            let formatJson = type === 'gauge_google' ?  {
                                prefix: request_fields['iq_' + type + '_google_chart_value_prefix'] ,
                                suffix: request_fields['iq_' + type + '_google_chart_value_postfix'],
                                fractionDigits:  request_fields['iq_' + type + '_google_chart_value_decimal']
                            } : {
                                prefix: request_fields['iq_' + type + '_chart_label_prefix'] ,
                                suffix: request_fields['iq_' + type + '_chart_label_postfix'],
                                fractionDigits: 0
                            }
                            if(graphina_localize.graphinaAllGraphsOptions[id].series.getNumberOfRows() > 0){
                                var formatter = new google.visualization.NumberFormat(formatJson);
                                formatter.format( graphina_localize.graphinaAllGraphsOptions[id].series, 1);
                            }
                        }
                        initGraphinaCharts(response.chart_id, type);
                    }else{
                        if (response.instant_init === true) {
                            graphina_localize.graphinaAllGraphsOptions[response.chart_id].animation = false;
                            instantInitGraphinaCharts(response.chart_id,type);
                        }
                        graphina_localize.graphinaAllGraphsOptions[response.chart_id].options = mergeDeep(graphina_localize.graphinaAllGraphsOptions[response.chart_id].options, response.chart_option);
                        if (isInit[response.chart_id] === true) {
                            initGraphinaCharts(response.chart_id, type);
                        }
                    }
                }

                if (request_fields['iq_' + type + '_chart_dynamic_data_option'] !== undefined) {
                    if (request_fields['iq_' + type + '_chart_dynamic_data_option'] === "sql-builder") {
                        if (jQuery('body').hasClass("elementor-editor-active")) {
                            setFieldsFromSQLStateMent(request_fields, response, type);
                        };
                    }
                }

                if (request_fields['iq_' + type + '_chart_dynamic_data_option'] !== undefined) {
                    if (request_fields['iq_' + type + '_chart_dynamic_data_option'] === "csv" || request_fields['iq_' + type + '_chart_dynamic_data_option'] === "remote-csv" || request_fields['iq_' + type + '_chart_dynamic_data_option'] === "google-sheet") {
                        if (jQuery('body').hasClass("elementor-editor-active")) {
                            setFieldsForCSV(request_fields, response, type);
                        };
                    }
                }

                if(request_fields['iq_' + type + '_chart_data_option'] !== undefined
                    && request_fields['iq_' + type + '_chart_data_option'] === 'forminator'){
                    if(jQuery('body').hasClass("elementor-editor-active")) {
                        setFieldsFromForminator(request_fields, response, type);
                    };
                }
            }
        },
        error: function() {
            console.log('fail');
        }
    });

}

function setFieldsFromSQLStateMent(request_fields, response, type) {


    let manualSql = manualChartList;
    if (manualSql.includes(type)) {
        if (response.sql_fail !== undefined && response.sql_fail !== '') {
            let char_element = document.querySelector('[id="' + type + '-chart"]');
            if (char_element !== null) {
                char_element.innerHTML = '';
                char_element.innerHTML = "<div class='text-center' style='color:red'> No data found, Please check your sql statement. </div>";
            }
            return;
        }
    } else {
        if (response.extra !== undefined && response.extra.sql_fail !== undefined && response.extra.sql_fail !== '') {
            let char_element = document.querySelector('[id="' + type + '-chart"]');
            if (char_element !== null) {
                char_element.innerHTML = '';
                char_element.innerHTML = "<div class='text-center' style='color:red'> No data found, Please check your sql statement. </div>";
            }
            return;
        }
    }

    // graphina pro sql-builder select sql result column
    let db_columns = manualSql.includes(type) ? response.db_column : response.extra.db_column;


    let element_x = parent.document.querySelector('[data-setting="iq_' + type + '_chart_sql_builder_x_columns"]');
    let element_y = parent.document.querySelector('[data-setting="iq_' + type + '_chart_sql_builder_y_columns"]');

    if (element_x == null || element_y == null) {
        return;
    }

    x_option_tag = '';
    y_option_tag = '';

    if (db_columns !== undefined && db_columns.length !== undefined && db_columns.length > 0) {
        db_columns.forEach(function(currentValue, index, arr) {
            x_axis_selected_field = '';
            y_axis_selected_field = '';
            if (request_fields['iq_' + type + '_chart_sql_builder_x_columns'].includes(currentValue)) {
                x_axis_selected_field = 'selected';
            }
            if (request_fields['iq_' + type + '_chart_sql_builder_y_columns'].includes(currentValue)) {
                y_axis_selected_field = 'selected';
            }
            x_option_tag += '<option value="' + currentValue.toLowerCase() + '" ' + x_axis_selected_field + ' > ' + currentValue + '</option>';
            y_option_tag += '<option value="' + currentValue.toLowerCase() + '" ' + y_axis_selected_field + ' > ' + currentValue + '</option>';
        });
    }

    element_x.innerHTML = x_option_tag;

    element_y.innerHTML = y_option_tag;

}

function setFieldsForCSV(request_fields, response, type) {

    

    let manualCsv = manualChartList;

    let csv_columns = manualCsv.includes(type) ? response.column : response.extra.column;
    
    if (csv_columns !== undefined && csv_columns.length !== undefined && csv_columns.length > 0) {

        let element_x = parent.document.querySelector('[data-setting="iq_' + type + '_chart_csv_x_columns"]');

        let element_y = parent.document.querySelector('[data-setting="iq_' + type + '_chart_csv_y_columns"]');

        if (element_x == null || element_y == null) {

            return;
        }

        x_option_tag = '';
        y_option_tag = '';

        csv_columns.forEach(function(currentValue, index, arr) {


            x_axis_selected_field = '';
            y_axis_selected_field = '';

            if (request_fields['iq_' + type + '_chart_csv_x_columns'].includes(currentValue)) {
                x_axis_selected_field = 'selected';
            }
            if (request_fields['iq_' + type + '_chart_csv_y_columns'].includes(currentValue)) {
                y_axis_selected_field = 'selected';
            }

            x_option_tag += '<option value="' + currentValue.toLowerCase() + '" ' + x_axis_selected_field + ' > ' + currentValue + '</option>';

            y_option_tag += '<option value="' + currentValue.toLowerCase() + '" ' + y_axis_selected_field + ' > ' + currentValue + '</option>';


        });
        element_x.innerHTML = x_option_tag;
        element_y.innerHTML = y_option_tag;
    }

}

function graphinasetCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function graphinaRestrictedPasswordAjax(form, e) {
    e.preventDefault()
    jQuery.ajax({
        url: graphina_localize.ajaxurl,
        type: "post",
        data: jQuery(form).serialize(),
        success: function(response) {
            if (response.status === true) {
                graphinasetCookie(response.chart, true, 1);
                location.reload();
            } else {
                jQuery(form).find('.graphina-error').css('display', 'flex');
            }
        }
    });



}

function graphinaChartFilter(type, selectedValue, id) {
    jQuery(document).find('.' + type + '-chart-' + id + '-loader').removeClass('d-none');
    jQuery(document).find('.' + type + '-chart-' + id + '-loader').find('img').removeClass('d-none');
    jQuery(document).find('.' + type + '-chart-' + id + '-loader').find('p').addClass('d-none');
    jQuery(document).find('.' + type + '-chart-' + id).addClass('d-none');
    jQuery(document).find('.' + type + '-chart-' + id).parents('.chart-box').addClass('d-none')
    getDataForChartsAjax(graphina_localize.graphinaAllGraphsOptions[id].setting_date, type, id, graphinaGetSelectOptionValue(id));

}

function graphinaGetSelectOptionValue(id) {
    let option = []
    let allSelect = document.querySelectorAll('.graphina_filter_select' + id);
    for (let i = 0; i < allSelect.length; i++) {
        if(allSelect[i].type !== undefined && ['datetime-local','date'].includes(allSelect[i].type)){
            if (allSelect[i].value !== undefined) {
                let formatsign = "-";
                let date = new Date(allSelect[i].value)
                if (date !== undefined) {
                    let formatDate = '';
                    if (allSelect[i].type === 'date') {
                        formatDate = date.getFullYear() + formatsign + ("00" + (date.getMonth() + 1)).slice(-2) + formatsign +
                            ("00" + date.getDate()).slice(-2);
                    } else {
                        formatDate = date.getFullYear() + formatsign + ("00" + (date.getMonth() + 1)).slice(-2) + formatsign +
                            ("00" + date.getDate()).slice(-2) + " " +
                            ("00" + date.getHours()).slice(-2) + ":" +
                            ("00" + date.getMinutes()).slice(-2) + ":" +
                            ("00" + date.getSeconds()).slice(-2);
                    }
                    option.push(formatDate)
                }
            }
        }else{
            if (allSelect[i].value !== undefined || allSelect[i].value !== null) {
                if (allSelect[i].value !== 'default') {
                    option.push(allSelect[i].value)
                } else {
                    option.push('')
                }
            }
        }
    }
    return option;
}

function graphinaGoogleChartInit(ele, options, id, type) {
    resetGraphinaVars();
    if (id in graphina_localize.graphinaAllGraphs) {
        graphina_localize.graphinaAllGraphs[id].clearChart();
        delete graphina_localize.graphinaAllGraphs[id];
        delete graphina_localize.graphinaBlockCharts[id];
    }
    isInit[id] = false;
    graphina_localize.graphinaAllGraphsOptions[id] = options;
    if (ele !== null) {
        if (graphina_localize.is_view_port_disable != undefined && graphina_localize.is_view_port_disable == 'on') {
            graphinaGoogleChartRender(id, type);
        } else {
            const observer = new IntersectionObserver(enteries => {
                enteries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (isInit[id] === false) {
                            graphinaGoogleChartRender(id, type);
                        }
                    }
                })
            })
            observer.observe(ele);
        }
    }
}

function graphinaGoogleChartRender(id, type) {
    if (isInit[id] === true || graphina_localize.graphinaAllGraphs[id]) {
        graphina_localize.graphinaAllGraphs[id] = new google.visualization[graphina_localize.graphinaAllGraphsOptions[id].renderType](graphina_localize.graphinaAllGraphsOptions[id].ele);
        graphina_localize.graphinaAllGraphs[id].draw(graphina_localize.graphinaAllGraphsOptions[id].series, graphina_localize.graphinaAllGraphsOptions[id].options);
    } else {
        graphina_localize.graphinaAllGraphs[id] = new google.visualization[graphina_localize.graphinaAllGraphsOptions[id].renderType](graphina_localize.graphinaAllGraphsOptions[id].ele);
        graphina_localize.graphinaAllGraphs[id].draw(graphina_localize.graphinaAllGraphsOptions[id].series, graphina_localize.graphinaAllGraphsOptions[id].options);
    }
    isInit[id] = true;
    // window.wp.hooks.doAction('graphina_google_chart_render', type,id);
    
    if (type === 'gauge_google' && typeof graphina_localize.graphinaAllGraphs[id] != "undefined") {
        Array.prototype.forEach.call(graphina_localize.graphinaAllGraphsOptions[id].ele.getElementsByTagName('circle'), function(circle) {
            if (circle.getAttribute('fill') === '#4684ee') {
                circle.setAttribute('fill', typeof graphina_localize.graphinaAllGraphsOptions[id].ballColor !== "undefined" ? graphina_localize.graphinaAllGraphsOptions[id].ballColor : '#4684ee');
            }
            if (circle.getAttribute('fill') === '#f7f7f7') {
                circle.setAttribute('fill', typeof graphina_localize.graphinaAllGraphsOptions[id].innerCircleColor !== "undefined" ? graphina_localize.graphinaAllGraphsOptions[id].innerCircleColor : '#f7f7f7');
            }
            if (circle.getAttribute('fill') === '#cccccc') {
                circle.setAttribute('fill', typeof graphina_localize.graphinaAllGraphsOptions[id].outerCircleColor !== "undefined" ? graphina_localize.graphinaAllGraphsOptions[id].outerCircleColor : '#cccccc');
            }
        });
        Array.prototype.forEach.call(graphina_localize.graphinaAllGraphsOptions[id].ele.getElementsByTagName('path'), function(path) {
            if (path.getAttribute('stroke') === '#c63310') {
                path.setAttribute('stroke', typeof graphina_localize.graphinaAllGraphsOptions[id].needleColor !== "undefined" ? graphina_localize.graphinaAllGraphsOptions[id].needleColor : '#c63310');
                path.setAttribute('fill', typeof graphina_localize.graphinaAllGraphsOptions[id].needleColor !== "undefined" ? graphina_localize.graphinaAllGraphsOptions[id].needleColor : '#c63310');
            }
        });
    }
}

function setFieldsFromForminator(request_fields, response, type) {
    if(request_fields['iq_' + type + '_section_chart_forminator_aggregate'] !== undefined && request_fields['iq_' + type + '_section_chart_forminator_aggregate'] === 'yes'){
        let element_aggregate = parent.document.querySelector('[data-setting="iq_' + type + '_section_chart_forminator_aggregate_column"]');
        if (element_aggregate == null) {
            return;
        }
        let manualForminator = manualChartList;
        let forminator_columns = manualForminator.includes(type) ? response.forminator_columns: response.extra.forminator_columns ;
        let forminator_columns_labels = manualForminator.includes(type) ? response.forminator_columns_labels: response.extra.forminator_columns_labels ;
        aggregate_column_option_tag = '' ;
        if(forminator_columns !== undefined &&  forminator_columns.length !== undefined && forminator_columns.length > 0) {
            let labels = '';
            forminator_columns.forEach(function(currentValue, index, arr) {
                labels = '';
                labels = forminator_columns_labels !== undefined &&  forminator_columns_labels.length > 0 && forminator_columns_labels[index] !== undefined ? forminator_columns_labels[index] : currentValue;
                aggregate_column_selected_field = '' ;
                if(request_fields['iq_' + type + '_section_chart_forminator_aggregate_column'].includes(currentValue)) {
                    aggregate_column_selected_field = 'selected' ;
                }
                aggregate_column_option_tag += '<option value="' + currentValue + '" ' + aggregate_column_selected_field + ' > ' + labels + '</option>' ;

            });
        }
        element_aggregate.innerHTML = aggregate_column_option_tag ;
    }else{
        let element_x = parent.document.querySelector('[data-setting="iq_' + type + '_section_chart_forminator_x_axis_columns"]');
        let element_y = parent.document.querySelector('[data-setting="iq_' + type + '_section_chart_forminator_y_axis_columns"]');
        if (element_x == null || element_y == null) {
            return;
        }
        let manualForminator = manualChartList;
        // graphina pro sql-builder select sql result column
        let forminator_columns = manualForminator.includes(type) ? response.forminator_columns: response.extra.forminator_columns ;
        let forminator_columns_labels = manualForminator.includes(type) ? response.forminator_columns_labels: response.extra.forminator_columns_labels ;
        x_option_tag = '' ;
        y_option_tag = '' ;
        if(forminator_columns !== undefined &&  forminator_columns.length !== undefined && forminator_columns.length > 0) {
            let labels = '';
            forminator_columns.forEach(function(currentValue, index, arr) {
                labels = '';
                labels = forminator_columns_labels !== undefined &&  forminator_columns_labels.length > 0 && forminator_columns_labels[index] !== undefined ? forminator_columns_labels[index] : currentValue;
                x_axis_selected_field = '' ;
                y_axis_selected_field = '' ;
                if(request_fields['iq_' + type + '_section_chart_forminator_x_axis_columns'].includes(currentValue)) {
                    x_axis_selected_field = 'selected' ;
                }
                if(request_fields['iq_' + type + '_section_chart_forminator_y_axis_columns'].includes(currentValue)) {
                    y_axis_selected_field = 'selected' ;
                }
                x_option_tag += '<option value="' + currentValue + '" ' + x_axis_selected_field + ' > ' + labels + '</option>' ;
                y_option_tag += '<option value="' + currentValue + '" ' + y_axis_selected_field + ' > ' + labels + '</option>' ;
            });
        }
        element_x.innerHTML = x_option_tag ;
        element_y.innerHTML = y_option_tag ;
    }
}

function graphina_google_chart_ajax_reload(callAjax,type,chart_id,ajaxReload,ajaxIntervalTime){
    let setting = graphina_localize.graphinaAllGraphsOptions[chart_id].setting_date;
    if(typeof getDataForChartsAjax !== "undefined" && callAjax === "1") {
        getDataForChartsAjax(setting, type, chart_id);
        if(ajaxReload === 'true'){
            window['ajaxIntervalGraphina_' + chart_id] = setInterval(function () {
                getDataForChartsAjax(setting, type, chart_id);
            }, parseInt(ajaxIntervalTime * 1000));
        }
    }
}