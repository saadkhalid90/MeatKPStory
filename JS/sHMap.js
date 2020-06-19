function drawSHMap(){
    // geo parameters
    const projection = d3.geoMercator()
        .center([75.5, 34.8])
        .scale([150 * 25]);

    const path = d3.geoPath().projection(projection);

    // get the SVG selection
    const svg = d3.select('svg.sHMap');

    const radScale = d3.scaleSqrt()
                      .domain([0, 5])
                      .range([0, 15]);

    const colScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range(['#e0ecf4', d3.rgb('#8856a7').darker()])

    const title = "Distribution of slaughterhouses across KP";
    const subTitle = "Source: Directorate of Veterinary Public Health";
    const note = 'Circles with dark grey strokes signify share of slaughterhouses under Cantonment Board'

    function appendTitle(main, center, styles, svgSelection, pos){
      const svgWidth = 500;
      const svgHeight = 600;
      const titleX = center ? svgWidth/2 : pos.title[0] * svgWidth;
      const titleY = pos.title[1] * svgHeight;

      const subTitleX = center ? svgWidth/2 : pos.subTitle[0] * svgWidth;
      const subTitleY = pos.subTitle[1] * svgHeight;

      svgSelection.append('text')
                .classed('titleSVG', true)
                .text(main.title)
                .attr('x', titleX)
                .attr('y', titleY)
                .styles(styles.title);

      svgSelection.append('text')
                .classed('subTitleSVG', true)
                .text(main.subTitle)
                .attr('x', subTitleX)
                .attr('y', subTitleY)
                .styles(styles.subTitle);
    }

    appendTitle(
      {
        title: title,
        subTitle: subTitle
      },
      true,
      {
        title: {
          fill: '#DF4F57',
          'text-anchor': 'middle',
          'font-size': '20px',
          'font-family': 'Roboto, sans-serif',
          'font-weight': 500
        },
        subTitle: {
          fill: '#DF4F57',
          'text-anchor': 'middle',
          'font-size': '12.6px',
          'font-family': 'Roboto, sans-serif',
          'font-weight': 400
        },
      },
      svg,
      {
        title: [0.05, 0.05],
        subTitle: [0.05, 0.085],
      }
    )

    svg.append('text')
      .text(note)
      .attr('x', 225)
      .attr('y', 580)
      .styles(
        {
          fill: 'black',
          'text-anchor': 'middle',
          'font-size': '8px',
          'font-family': 'Roboto, sans-serif'
        }
    )

    async function readAndDraw(){
      const SH = await d3.csv('Data/KP_SHs.csv');
      const KPGeo = await d3.json('GeoData/KP.topojson');

      const KPFeatures = topojson.feature(KPGeo, KPGeo.objects.KP).features;

      drawBaseMap(
        //geodata params
        {
          data: KPGeo,
          dataName: 'KP'
        },
        // selection
        svg,
        // attributes object
        {
          class: d => `region ${rmSpace(d.properties.districts)}`,
          d: d => path(d)
        },
        // styles object
        {
          fill: '#aaa',
          stroke: 'grey',
          'stroke-opacity': 0.2

        },
        d => [
          "Khyber Pakhtunkhwa",
          //"Federally Administered Tribal Areas"
        ].includes(d.properties.province_territory)
      );

      // appending groups containing circles
      const circG = svg.selectAll('g.SHGroup')
        .data(SH)
        .enter()
        .append('g')
        .classed('SHGroup', true);

      circG
        .filter(d => +d.CanttSHs > 0)
        .append('circle')
        .classed('milSHCirc', true)
        .attr('cx', d => projection([+d.X, +d.Y])[0])
        .attr('cy', d => projection([+d.X, +d.Y])[1])
        .attr('r', d => radScale(+d.SHs))
        .styles({
          fill: '#212121',
          stroke: 'none',
          'fill-opacity': 1
        });

      circG
        .append('circle')
        .classed('SHCirc', true)
        .attr('cx', d => projection([+d.X, +d.Y])[0])
        .attr('cy', d => projection([+d.X, +d.Y])[1])
        .attr('r', d => radScale(+d.FuncSHs + +d.NonFuncSHs))
        .styles({
          fill: d => {
            const FandNF = +d.FuncSHs + +d.NonFuncSHs;
            return colScale(+d.FuncSHs/FandNF);
          },
          stroke: 'none',
          'fill-opacity': 1
        });

        makeNestCircLegend(svg, [400, 500], [1, 5], radScale, 'Number of Slaughterhouses', '');
        drawContLegend(svg, [20, 150], 0, 100, ['#e0ecf4', d3.rgb('#8856a7').darker()], 'black');

        svg.selectAll('circle.shcirc').on('mouseover', function(d, i){
          const datum = d3.select(this).datum();
          const district = datum['districts'];
          const SHs = datum['SHs'];
          const FSHs = datum['FuncSHs'];
          const CSHs = datum['CanttSHs'];

          const eventX = d3.event.x;
          const eventY = d3.event.y;

          d3.select('body').append('div')
                          .classed('tooltip', true)
                          .html(
                            d =>
                            `
                              <p>
                                <span class='varName'>District</span>: <span>${district}</span><br>
                                <span class='varName'>Slaughterhouse(s)</span>: <span>${SHs}</span><br>
                                <span class='varName'>Functional</span>: <span>${FSHs}</span><br>
                                <span class='varName'>In Cantt.</span>: <span>${CSHs}</span>
                              </p>
                            `
                          )
                          .styles({
                            position: 'fixed',
                            width: '150px',
                            left: `${eventX - 75}px`,
                            top: `${eventY + 15}px`,
                            background: '#eee',
                            'border-color': '#212121',
                            opacity: 0.9,
                            'font-family': "'Roboto', sans-serif",
                            'font-size': '13px'
                          })

        });

        svg.selectAll('circle.shcirc').on('mouseout', function(d, i){

          d3.select('body').select('div.tooltip')
                           .remove();

        })
    }

    readAndDraw();


    function drawBaseMap(geoData, selection, attrsObj, stylesObj, filterFunc){
        // use topojson to get features of the geoData
        const geoDataArr = topojson.feature(geoData.data, geoData.data.objects[geoData.dataName]).features
                          .filter(filterFunc);


        // use the features to draw the map
        selection.selectAll('path')
              .data(geoDataArr)
              .enter()
              .append('path')
              .attrs(attrsObj)
              .styles(stylesObj);
    }

    function rmSpace(string){
      return string.split(" ").join("");
    }

    function round2Dec(number, digits){
      return Math.round(number* (10**digits))/(10**digits);
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

    function drawContLegend(selector, position, minScale, maxScale, colorArr, textCol) {

        let rectWidth = 100;
        let rectHeight = 5;

        let barG = selector.append('g')
                            .attr('class', 'legendGroup')
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
                              .text('Percent Functional')
                              .attr('transform', 'translate(' + 0 + ',' + (-10) + ')')
                              .style('fill', textCol)
                              .style('font-size', '11px');

    }
}

drawSHMap();
