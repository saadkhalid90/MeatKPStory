function drawSurveySH(){
  const projection = d3.geoMercator()
      .center([74.3, 34])
      .scale([150 * 30]);

  const path = d3.geoPath().projection(projection);
  const svg = d3.select('svg.sHVol')
                // .append('g')
                // .attr('class', 'vizGrid')
                // .attr('transform', 'translate(0, 50)');
  const width = 600;
  const height = 720;

  const svgG = svg.append('g')
                .attr('class', 'vizGrid')
                .attr('transform', 'translate(0, 20)');

  const txObj = {
    'kohistan': `translate(-490, -50) scale(1.6)`,
    'abbotabad': `translate(-920, -510) scale(2.7)`,
    'peshawar': `translate(-570, -540) scale(2.7)`,
    'dikhan': `translate(-175, -590) scale(1.6)`
  }

  async function readAndDraw(){
    let SHData = await d3.csv('Data/SH.csv');
    //let geoData = await d3.json('KP_CVC.topojson');
    let kohistan = await getGeoData('GeoData/kohistan.topojson', 'kohistan');
    let peshawar = await getGeoData('GeoData/Peshawar.topojson', 'Peshawar');
    let abbotabad = await getGeoData('GeoData/Abbotabad.topojson', 'Abbotabad');
    let dikhan = await getGeoData('GeoData/DIKhan.topojson', 'DIKhan');
    // let kohistan = await getGeoData('kohistan.topojson', 'kohistan');

    // append title and subtitles
    svg.append('text')
      .attr('class', 'title')
      .attr('x', '300px')
      .attr('y', '15px')
      .text('Capacity of Slaughterhouses')
      .styles(
        {
          'text-anchor': 'middle',
          'font-size': '18px',
          'font-family': "'Roboto', sans-serif"
        }
      );

    svg.append('text')
      .attr('class', 'sub-title')
      .attr('x', '300px')
      .attr('y', '35px')
      .text('Ruminants Slaughtered Per Day')
      .styles(
        {
          'text-anchor': 'middle',
          'font-size': '12px',
          'font-family': "'Roboto', sans-serif",
          'font-weight': 300
        }
      );

    svg.append('text')
      .attr('class', 'bottom-note')
      .attr('x', '300px')
      .attr('y', '710px')
      .text('The bubbles corresponding to each Slaughterhouse do not show exact geo-location as they have been offset to avoid overlap')
      .styles(
        {
          'text-anchor': 'middle',
          'font-size': '9px',
          'font-family': "'Roboto', sans-serif",
          'font-weight': 300
        }
      );

    const slotTx = [
      [0, 0],
      [0, 300],
      [300, 0],
      [300, 300]
    ];

    svgG.selectAll('g.distSlot')
      .data([1, 2, 3, 4])
      .enter()
      .append('g')
      .classed('distSlot', true)
      .attr('id', d => `id${d}`)
      .attr('transform', (d, i) => `translate(${slotTx[i][0]}, ${slotTx[i][1]})`);

    function appMapPaths(gSelect, geoData, txString, styleObj, rect, label, HQLoc, scaleFactor, HQName, HQNameTx){
      if (rect){
        gSelect.append('rect')
              .attrs({
                x: 0,
                y: 0,
                width: 300,
                height: 300
              })
              .styles({
                fill: '#eee'
              });
      }

      gSelect
        .append('g')
        .attr('class', 'mapPaths')
        .selectAll('path')
        .data(geoData)
        .enter()
        .append('path')
        .attr('class', 'region tehsil')
        .attr('transform', txString)
        .attr('d', d => path(d))
        .styles(styleObj);

      // append district label text
      gSelect.append('text')
          .attrs({
            x: 150,
            y: 270
          })
          .text(label)
          .styles({
            fill: 'black',
            'text-anchor': 'middle',
            'font-family': "'Roboto', sans-serif",
            'font-size': '13px',
            'font-weight': 300
          })

      const HQGrp = gSelect.append('g')
            .attr('class', 'HQGrp');

      HQGrp.append('circle')
            .attrs({
              class: 'HQ',
              cx: d => projection(HQLoc)[0],
              cy: d => projection(HQLoc)[1],
              r: d => 4/scaleFactor,
              transform: txString
            })
            .styles({
              fill: 'grey',
            })

      HQGrp.append('circle')
            .attrs({
              class: 'HQ',
              cx: d => projection(HQLoc)[0],
              cy: d => projection(HQLoc)[1],
              r: d => 6/scaleFactor,
              transform: txString
            })
            .styles({
              fill: 'none',
              stroke: 'grey',
              'stroke-width': 1/scaleFactor
            })

      HQGrp.append('text')
            .attrs({
              class: 'HQ',
              x: d => projection(HQLoc)[0],
              y: d => projection(HQLoc)[1],
              dx: HQNameTx[0],
              dy: HQNameTx[1],
              transform: txString
            })
            .text(HQName)
            .styles({
              fill: '#212121',
              'font-size': `${10/scaleFactor}px`,
              'font-family': "'Roboto', sans-serif"
            })
    }

    const radScale1 = d3.scaleSqrt()
                        .domain([0, 150])
                        .range([0, 10]);

    const radScale2 = d3.scaleSqrt()
                        .domain([0, 4])
                        .range([0, 10]);

    const bubOffset = 0.2;

    let colScaleCont = d3.scaleSequential(d3.interpolatePuOr)
        .domain([80, 20]);

    let simulation = d3.forceSimulation(SHData)
        .force("x", d3.forceX(function(d) { return projection( [+d.X, +d.Y] )[0]; }).strength(0.2))
        .force("y", d3.forceY(function(d) { return projection( [+d.X, +d.Y] )[1]; }).strength(0.2))
        //.force('charge', d3.forceManyBody().strength(0.5))
        .force("collision", d3.forceCollide().radius(d => (radScale1(+d['total_Animals'])/d.scaleFactor) + bubOffset /*+ centuryScale(getHCUnits(d, false))*/))
        .stop();

    // let the simulation run
    for (var i = 0; i < 5000; ++i) simulation.tick();

    makeNestCircLegend(CSSSelect = 'svg.sHVol', [130, 650], [50, 200, 400], radScale1, 'Animals Slaughtered (Per day)');
    drawContLegend(
      svg,
      [400, 650], 20, 80,
      [colScaleCont(20), colScaleCont(80)],
      'black',
      `Percentage of small ruminants`
    );

    function appBubbles(gSelect, data, dataAcc, txString, StyleObj, dithArr, sh, scale){
      gSelect.append('g')
            .attr('class', 'bubbleGroup')
            .selectAll('circle.shBubble')
            .data(data.sort(function(a, b) {
                return b[dataAcc] - a[dataAcc];
            }))
            .enter()
            .append('circle')
            .classed('shBubble', true)
            .attrs({
              // cx: d => projection([+d.x, +d.y])[0] + dithArr[0],
              // cy: d => projection([+d.x, +d.y])[1] + dithArr[1],
              cx: d => d.x,
              cy: d => d.y,
              r: d => sh ? radScale2(+d[dataAcc])/scale : radScale1(+d[dataAcc])/scale,
              transform: txString
            })
            .styles(StyleObj)
            .style('stroke-width', '0.3px')
            .style('stroke-opacity', 0.7)
            .style('stroke', '#424242');
    }

    const shFillOpac = 0.9;

    appMapPaths(
      svgG.select('g#id1'),
      kohistan,
      txObj['kohistan'],
      {
        fill: '#ccc',
        'fill-opacity': 0.8
      },
      false,
      "Kohistan",
      [73.3703, 35.3601],
      1.6,
      "Dassu Dist. HQ",
      [6, 0]
    );

    // appBubbles(
    //   svgG.select('g#id1'),
    //   popData.filter(d => d.District == 'Kohistan'),
    //   'Farmers',
    //   txObj['kohistan'],
    //   {
    //     fill: '#a6cee3',
    //     'fill-opacity': shFillOpac,
    //     stroke: 'black',
    //   },
    //   [0, 0],
    //   false,
    //   1.6
    // );


    appMapPaths(
      svgG.select('g#id2'),
      peshawar,
      txObj['peshawar'],
      {
        fill: '#ccc',
        'fill-opacity': 0.8
      },
      false,
      "Peshawar",
      [71.5245, 34.0151],
      2.7,
      "Peshawar",
      [-20, 0]
    );

    appBubbles(
      svgG.select('g#id2'),
      SHData.filter(d => d.district == 'Peshawar'),
      'total_Animals',
      txObj['peshawar'],
      {
        fill: d => colScaleCont((d.small_ruminant/ d.total_Animals)*100),
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [0, 0],
      false,
      2.7
    )


    appMapPaths(
      svgG.select('g#id3'),
      abbotabad,
      txObj['abbotabad'],
      {
        fill: '#ccc',
        'fill-opacity': 0.8
      },
      false,
      "Abbottabad",
      [73.2215, 34.1688],
      2.7,
      "Abbottabad",
      [-24, 0]
    );

    appBubbles(
      svgG.select('g#id3'),
      SHData.filter(d => d.district == 'Abbottabad'),
      'total_Animals',
      txObj['abbotabad'],
      {
        fill: d => colScaleCont((d.small_ruminant/ d.total_Animals)*100),
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [0, 0],
      false,
      2.7
    );

    appMapPaths(
      svgG.select('g#id4'),
      dikhan,
      txObj['dikhan'],
      {
        fill: '#ccc',
        'fill-opacity': 0.8
      },
      false,
      "D.I.Khan",
      [70.9019, 31.8628],
      1.6,
      "D.I.Khan",
      [5, 0]
    );

    appBubbles(
      svgG.select('g#id4'),
      SHData.filter(d => d.district == 'D.I.Khan'),
      'total_Animals',
      txObj['dikhan'],
      {
        fill: d => colScaleCont((d.small_ruminant/ d.total_Animals)*100),
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [0, 0],
      false,
      1.6
    );

    svgG.selectAll('circle.shBubble').on('mouseover', function(d, i){
      const datum = d3.select(this).datum();
      const eventX = d3.event.x;
      const eventY = d3.event.y;

      //d3.select('div.popVizContain')
      d3.select('body')
                      .append('div')
                      .classed('tooltip', true)
                      .html(
                        d =>
                        `
                          <p>
                            <span class='varName'>Ownership: </span> <span>${datum.owns_slaughterhouse}</span><br>
                            <span class='varName'>Animals Slaughtered: </span> <span>${datum.total_Animals}</span><br>
                            <span class='varName'>Small Animals: </span> <span>${datum.small_ruminant}</span><br>
                            <span class='varName'>Big Animals: </span> <span>${datum.big_ruminant}</span><br>
                          </p>
                        `
                      )
                      .styles({
                        position: 'fixed',
                        width: '140px',
                        left: `${eventX - 70}px`,
                        top: `${eventY + 15}px`,
                        background: '#eee',
                        'border-color': '#212121',
                        opacity: 0.9,
                        'font-family': "'Roboto', sans-serif",
                        'font-size': '10px'
                      })

    });

    svgG.selectAll('circle.shBubble').on('mouseout', function(d, i){
      //d3.select('div.popVizContain')
      d3.select('body')
        .select('div.tooltip')
        .remove();

    })


  }

  readAndDraw();

  async function getGeoData(topoJSONFilename, getName){
    const JSON = await d3.json(topoJSONFilename);
    return topojson.feature(JSON, JSON.objects[getName]).features;
  }

  function getPxAttr(selection, attribute){
    return +selection.attr(attribute).replace('px', '')
  }
}

drawSurveySH();
