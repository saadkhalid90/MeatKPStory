function drawPopMap(){
  const projection = d3.geoMercator()
      .center([74.3, 34])
      .scale([150 * 30]);

  const path = d3.geoPath().projection(projection);
  const svg = d3.select('svg.popVizSVG')
                // .append('g')
                // .attr('class', 'vizGrid')
                // .attr('transform', 'translate(0, 50)');
  // const width = getPxAttr(svg, 'width');
  // const height = getPxAttr(svg, 'height');

  const width = 600;
  const height = 700;

  const svgG = svg.append('g')
                .attr('class', 'vizGrid')
                .attr('transform', 'translate(0, 20)');

  const txObj = {
    'kohistan': `translate(-490, -50) scale(1.6)`,
    'abbotabad': `translate(-920, -510) scale(2.7)`,
    'peshawar': `translate(-570, -540) scale(2.7)`,
    'dikhan': `translate(-175, -590) scale(1.6)`
  }

  const VCAObj = {
    Farmers: "Farmers",
    SlaughterHouses: "Slaughter-houses",
    ButcherShops: "Butcher-shops",
    Middlemen: "Middlemen"
  }

  async function readAndDraw(){
    let popData = await d3.csv('Data/CattleVCPop.csv');
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
      .attr('y', '25px')
      .text('Tehsil-wise Sample Sizes of Major Meat Value Chain Actors')
      .styles(
        {
          'text-anchor': 'middle',
          'font-size': '20px',
          'font-family': "'Roboto', sans-serif",
          'font-weight': 400
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
      // a rectangle to test if the path is centered
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
            'font-size': '14px'
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
              stroke: 'black',
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
                        .domain([0, 100])
                        .range([0, 20]);

    const radScale2 = d3.scaleSqrt()
                        .domain([0, 4])
                        .range([0, 10]);

    makeNestCircLegend(CSSSelect = 'svg', [100, 650], [10, 40, 100], radScale1, ['Farmers and', 'Butcher-shops']);
    makeNestCircLegend(CSSSelect = 'svg', [280, 650], [1, 4], radScale2, ['Slaughter-houses', 'and Middlemen']);

    const ordCol = d3.scaleOrdinal()
      .domain(["Farmers", "Butcher-shops", "Slaughter-Houses", "Middlemen"])
      .range(['#a6cee3','#1f78b4','#b2df8a', '#33a02c']);

    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(400,630)");

    const legendOrdinal = d3.legendColor()
      .shapePadding(1)
      //use cellFilter to hide the "e" cell
      .scale(ordCol);

    svg.select(".legendOrdinal")
      .call(legendOrdinal);

    function appBubbles(gSelect, data, dataAcc, txString, StyleObj, dithArr, sh, scale){
      gSelect.append('g')
            .attr('class', 'bubbleGroup')
            .selectAll('circle.popBubble')
            .data(data)
            .enter()
            .append('circle')
            .classed('popBubble', true)
            .classed(dataAcc, true)
            .attrs({
              cx: d => projection([+d.X, +d.Y])[0] + dithArr[0],
              cy: d => projection([+d.X, +d.Y])[1] + dithArr[1],
              r: d => sh ? radScale2(+d[dataAcc])/scale : radScale1(+d[dataAcc])/scale,
              transform: txString
            })
            .styles(StyleObj)
            .style('stroke-width', '0.5px')
            .style('stroke-opacity', 0.5)
            .style('stroke', '#212121');
    }

    const shFillOpac = 0.85;

    appMapPaths(
      svgG.select('g#id1'),
      kohistan,
      txObj['kohistan'],
      {
        fill: d => d.properties.TEHSIL == 'DASSU' ? '#ccc' : '#ccc',
        'fill-opacity': 0.8
      },
      false,
      "Kohistan",
      [73.3703, 35.3601],
      1.6,
      "Dassu Dist. HQ",
      [6, 0]
    );

    appBubbles(
      svgG.select('g#id1'),
      popData.filter(d => d.District == 'Kohistan'),
      'Farmers',
      txObj['kohistan'],
      {
        fill: '#a6cee3',
        'fill-opacity': shFillOpac,
        stroke: 'black',
      },
      [5, 2],
      false,
      1.6
    );

    appBubbles(
      svgG.select('g#id1'),
      popData.filter(d => d.District == 'Kohistan'),
      'ButcherShops',
      txObj['kohistan'],
      {
        fill: '#1f78b4',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-5, -2],
      false,
      1.6
    );

    appBubbles(
      svgG.select('g#id1'),
      popData.filter(d => d.District == 'Kohistan'),
      'Middlemen',
      txObj['kohistan'],
      {
        fill: '#33a02c',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-2, 7],
      true,
      1.6
    );

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
      popData.filter(d => d.District == 'Peshawar'),
      'Farmers',
      txObj['peshawar'],
      {
        fill: '#a6cee3',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [1, 6],
      false,
      2.7
    )

    appBubbles(
      svgG.select('g#id2'),
      popData.filter(d => d.District == 'Peshawar'),
      'ButcherShops',
      txObj['peshawar'],
      {
        fill: '#1f78b4',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-1, -6],
      false,
      2.7
    );

    appBubbles(
      svgG.select('g#id2'),
      popData.filter(d => d.District == 'Peshawar'),
      'SlaughterHouses',
      txObj['peshawar'],
      {
        fill: '#b2df8a',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [8, -1],
      true,
      2.7
    );

    appBubbles(
      svgG.select('g#id2'),
      popData.filter(d => d.District == 'Peshawar'),
      'Middlemen',
      txObj['peshawar'],
      {
        fill: '#33a02c',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-8, 1],
      true,
      2.7
    );

    appMapPaths(
      svgG.select('g#id3'),
      abbotabad,
      txObj['abbotabad'],
      {
        fill: d => d.properties.TEHSIL == 'ABBOTTABAD' ? '#ccc' : '#ccc',
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
      popData.filter(d => d.District == 'Abbotabad'),
      'Farmers',
      txObj['abbotabad'],
      {
        fill: '#a6cee3',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [4, 1.5],
      false,
      2.7
    );

    appBubbles(
      svgG.select('g#id3'),
      popData.filter(d => d.District == 'Abbotabad'),
      'ButcherShops',
      txObj['abbotabad'],
      {
        fill: '#1f78b4',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-4, -1.5],
      false,
      2.7
    );

    appBubbles(
      svgG.select('g#id3'),
      popData.filter(d => d.District == 'Abbotabad'),
      'SlaughterHouses',
      txObj['abbotabad'],
      {
        fill: '#b2df8a',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-2, 6],
      true,
      2.7
    );

    appBubbles(
      svgG.select('g#id3'),
      popData.filter(d => d.District == 'Abbotabad'),
      'Middlemen',
      txObj['abbotabad'],
      {
        fill: '#33a02c',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [2, -6],
      true,
      2.7
    );

    appMapPaths(
      svgG.select('g#id4'),
      dikhan,
      txObj['dikhan'],
      {
        fill: d => d.properties.TEHSIL == 'D.I.KHAN' ? '#ccc' : '#ccc',
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
      popData.filter(d => d.District == 'D.I.Khan'),
      'Farmers',
      txObj['dikhan'],
      {
        fill: '#a6cee3',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [2.5, -4],
      false,
      1.6
    );

    appBubbles(
      svgG.select('g#id4'),
      popData.filter(d => d.District == 'D.I.Khan'),
      'ButcherShops',
      txObj['dikhan'],
      {
        fill: '#1f78b4',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-2.5, 4],
      false,
      1.6
    );

    appBubbles(
      svgG.select('g#id4'),
      popData.filter(d => d.District == 'D.I.Khan'),
      'SlaughterHouses',
      txObj['dikhan'],
      {
        fill: '#b2df8a',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [5, 5],
      true,
      1.6
    );

    appBubbles(
      svgG.select('g#id4'),
      popData.filter(d => d.District == 'D.I.Khan'),
      'Middlemen',
      txObj['dikhan'],
      {
        fill: '#33a02c',
        'fill-opacity': shFillOpac,
        stroke: 'black'
      },
      [-5, -5],
      true,
      1.6
    );

    svgG.selectAll('circle.popBubble').on('mouseover', function(d, i){
      const datum = d3.select(this).datum();
      const className = d3.select(this).attr('class').replace("popBubble ", "")
      const tehsil = datum['Tehsil'];
      const VCA = VCAObj[className];
      const datumOfInt = datum[className];

      const eventX = d3.event.x;
      const eventY = d3.event.y;


      console.log(eventX, eventY);
      d3.select('div.popVizContain').append('div')
                      .classed('tooltip', true)
                      .html(
                        d =>
                        `
                          <p>
                            <span class='varName'>Tehsil</span>: <span>${tehsil}</span><br>
                            <span class='varName'>${VCA}</span>: <span>${datumOfInt}</span>
                          </p>
                        `
                      )
                      .styles({
                        position: 'fixed',
                        width: '140px',
                        left: `${eventX - 60}px`,
                        top: `${eventY + 15}px`,
                        background: '#eee',
                        'border-color': '#212121',
                        opacity: 0.9,
                        'font-family': "'Roboto', sans-serif",
                        'font-size': '13px'
                      })

    });

    svgG.selectAll('circle.popBubble').on('mouseout', function(d, i){

      d3.select('div.popVizContain').select('div.tooltip')
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

drawPopMap();
