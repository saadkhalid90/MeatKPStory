function drawAccessHM(){
  async function readAndDraw(){
    const tehsilSum = await d3.csv('Data/tehsilSum.csv');

    const margin = {
      top: 150,
      bottom: 20,
      left: 210,
      right: 20
    };
    const svg = d3.select('svg.accessViz');
    const colScale = d3.scaleLinear()
                      .domain([0, 100])
                      .range(['#e0e0e0', '#4A148C']);

    const radScale = d3.scaleSqrt()
                      .domain([0, 90])
                      .range([0, 18]);


    // append a group within the svg
    const SVGG = svg.append('g')
      .attr('class', 'vizGrp')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tehsilGrp = SVGG.selectAll('g.tehsilGrp')
        .data(tehsilSum)
        .enter()
        .append('g')
        .classed('tehsilGrp', true)
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)

    tehsilGrp.selectAll('rect.heatCell')
        .data(d => [d.meanElec, d.meanWater, d.meanStorage])
        .enter()
        .append('rect')
        .attrs({
          class: 'heatCell hoverable',
          x: 0,
          y: 0,
          width:68,
          height: 19,
          transform: (d,i) => `translate(${i * 70}, 0)`,
        })
        .styles({
          fill: d => colScale(+d)
        })

    tehsilGrp.selectAll('text.tehsilLabels')
        .data(d => [d.tehsil])
        .enter()
        .append('text')
        .attrs({
          class: 'tehsilLabels',
          x: 0,
          y: 0,
          transform: (d,i) => `translate(-18, 15)`,
        })
        .text(d => d)
        .styles({
          fill: 'black',
          'text-anchor': 'end',
          'font-family': "'Roboto', sans-serif",
          'font-size': '14px',
          'font-weight': '300'

        })

    tehsilGrp.selectAll('text.distLabels')
        .data(d => [d.district])
        .enter()
        .append('text')
        .attrs({
          class: 'distLabels',
          x: 0,
          y: 0,
          transform: (d,i) => `translate(-180, 15)`,
        })
        .text(d => d)
        .styles({
          fill: '#424242',
          'text-anchor': 'start',
          'font-family': "'Roboto', sans-serif",
          'font-size': '14px',
          'font-weight': '500'
        })

    // append sample bubbles
    tehsilGrp.selectAll('text.sampleBub')
        .data(d => [d.nObs])
        .enter()
        .append('circle')
        .attrs({
          class: 'sampleBub hoverable',
          cx: 0,
          cy: 0,
          r: d => radScale(+d),
          transform: (d,i) => `translate(245, 10)`
        })
        .styles({
          fill: 'teal',
          'fill-opacity': 0.7
        })

    SVGG.selectAll('text.headers')
      .data(['Power', 'Water', 'Cold', 'Sample'])
      .enter()
      .append('text')
      .attr('class', 'headers')
      .text(d => d)
      .attr('transform', (d, i) => `translate(${35 + (i*69)}, -40)`)
      .styles({
        'text-anchor': 'middle',
        'fill': 'black',
        'font-family': "'Roboto', sans-serif",
        'font-size': '14px'
      })

    SVGG.selectAll('text.headers2')
      .data(['', '', 'Storage', 'Size'])
      .enter()
      .append('text')
      .attr('class', 'headers2')
      .text(d => d)
      .attr('transform', (d, i) => `translate(${35 + (i*70)}, -20)`)
      .styles({
        'text-anchor': 'middle',
        'fill': 'black',
        'font-family': "'Roboto', sans-serif",
        'font-size': '14px'
      })


    svg.append('text')
      .attrs({
        x: 250,
        y: 20,
        class: 'title'
      })
      .text("Butcher shops' access to Electricity, Water and Cold Storage")
      .styles({
        'text-anchor': 'middle',
        'fill': 'black',
        'font-family': "'Roboto', sans-serif",
        'font-size': '16px'
      });

    svg.append('text')
      .attrs({
        x: 250,
        y: 45,
        class: 'sub-title'
      })
      .text("Accoss Tehsils")
      .styles({
        'text-anchor': 'middle',
        'fill': 'black',
        'font-family': "'Roboto', sans-serif",
        'font-size': '14px'
      });

    svg.selectAll('.hoverable').on('mouseover', function(d, i){
      const datum = d3.select(this).datum();
      const type = d3.select(this).attr('class').replace(" hoverable", "");

      const eventX = d3.event.x;
      const eventY = d3.event.y;

      const unit = type == "heatCell" ? "%" : "";

      d3.select('div.accessContain').append('div')
                      .classed('tooltip', true)
                      .html(
                        d =>
                        `
                          <p>
                            <span>${round2Dec(datum, 1)}${unit}</span>
                          </p>
                        `
                      )
                      .styles({
                        position: 'fixed',
                        width: '50px',
                        left: `${eventX - 25}px`,
                        top: `${eventY + 15}px`,
                        background: '#eee',
                        'border-color': '#212121',
                        opacity: 0.9,
                        'font-family': "'Roboto', sans-serif",
                        'font-size': '13px'
                      })

    });

    svg.selectAll('.hoverable').on('mouseout', function(d, i){

      d3.select('div.accessContain').select('div.tooltip')
                       .remove();

    })

    makeNestCircLegend(svg, [200, 430], [10, 40, 90], radScale, ['Sample size']);
    drawContLegend(svg, [20, 430], 0, 100, ['#e0e0e0', '#4A148C'], 'black');

  }

  function drawContLegend(selector, position, minScale, maxScale, colorArr, textCol) {

      let rectWidth = 100;
      let rectHeight = 5;

      let barG = selector.append('g')
                          .attr('class', 'contLegGroup')
                          .attr('transform', `translate(${position[0]}, ${position[1]})`);



      var linGrad = barG.append("defs")
          .append("svg:linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")
          .attr("y1", "100%")
          .attr("x2", "100%")
          .attr("y2", "100%")
          .attr("spreadMethod", "pad");

      linGrad.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colorArr[0])
          .attr("stop-opacity", 1);

      // linGrad.append("stop")
      //     .attr("offset", "50%")
      //     .attr("stop-color", 'white')
      //     .attr("stop-opacity", 1);

      linGrad.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorArr[1])
          .attr("stop-opacity", 1);

      barG.append('rect')
          .attr('width', rectWidth)
          .attr('height', rectHeight)
          .attr('rx', 2)
          .attr('ry', 2)
          .style("fill", "url(#gradient)")
      //.style('stroke', '#212121')
      //  .style('stroke-width', '0.5px')

      barG.selectAll('text')
          .data([minScale, maxScale])
          .enter()
          .append('text')
          .text((d, i) => d)
          .attr('transform', (d, i) => i == 0 ? `translate(0, 15)` : `translate(${(i * 100)}, 15)`)
          .style('text-anchor', 'start')
          .style('fill', textCol)
          .style('font-size', '10px');

      let legendTitle = barG.append('text')
                            .attr('class', 'legendTitle')
                            .text('Percent with access')
                            .attr('transform', 'translate(' + 0 + ',' + (-10) + ')')
                            .style('fill', textCol)
                            .style('font-size', '11px');

  }

  function makeNestCircLegend(CSSSelect, transformArray, bubArray, bubScale, legendTitle, legendTitle2){
    CSSSelect
      .select('g.legendGroup')
      .remove();
    // appending a legendgroup
    let legendGroup = CSSSelect
                     .append('g')
                     .classed('legendGroup', true)
                     .attr('transform', `translate(${transformArray[0]}, ${transformArray[1]})`)

    legendGroup.append('text')
             .text(legendTitle)
             .classed('legendTitle', true)
             .attr('dy', 40)
             .style('font-size', '10px')
             .style('text-anchor', 'middle')
             .style('fill', 'black');

   legendGroup.append('text')
            .text(legendTitle2)
            .classed('legendTitle', true)
            .attr('dy', 60)
            .style('font-size', '10px')
            .style('text-anchor', 'middle')
            .style('fill', 'black');

    let radius = bubScale(d3.max(bubArray));
    // hard code params such as Padding and font size for now
    let legLabelPadding = 5;
    let legLabFontSize = 8;

    const circGroups = legendGroup.selectAll('circle')
             .data(bubArray)
             .enter()
             .append('g')
             .classed('circLegendGroup', true)
             .attr('transform', d => `translate(0, ${radius - bubScale(d)})`);

    circGroups.append('circle')
             .attr('r', d => bubScale(d))
             .style('stroke', 'black')
             .style('fill', 'none')
             .style('stroke-width', '1px');

    circGroups.append('text')
             .text(d => d)
             .attr('dx', radius + legLabelPadding)
             .attr('dy', d => -(bubScale(d) - legLabFontSize/2))
             .style('fill', 'black')
             .style('font-size', `${legLabFontSize}px`)
             .style('font-family', 'Open Sans')
  }

  readAndDraw();

  function round2Dec(number, digits){
    return Math.round(number* (10**digits))/(10**digits);
  }

}

drawAccessHM();
