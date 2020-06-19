function drawButchPriceHists(){
  let priceData;

  const varName = 'avg_price';

  const margin = {top: 20, right: 30, bottom: 20, left: 100},
        width = 600 - margin.left - margin.right,
        height = 120 - margin.top - margin.bottom,

        widthWM = width + margin.left + margin.right;
        heightWM = height + margin.top + margin.bottom;

  const x = d3.scaleLinear()
              .domain([0, 900])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
              .range([0, width]);

  const y = d3.scaleLinear()
            .range([height, 0]);

  const svg = d3.select('svg.butchPriceHists').append('g')
                .attr('transform', 'translate(50, 100)');

  svg.append('text')
    .attr('class', 'y-axis-title')
    .text('Frequency')
    .attr('x', '-100px')
    .attr('y', '-10px')
    .styles({
      'transform': 'rotate(-90deg)',
      'font-family': "'Roboto', sans-serif"
    })

  d3.select('svg.butchPriceHists').append('text')
    .attr('class', 'Title')
    .text(`Distribution of meat price per kilogram reported by butchers`)
    .attr('x', '300px')
    .attr('y', '20px')
    .styles({
      'text-anchor': 'middle',
      'font-family': "'Roboto', sans-serif",
      'font-size': '22px',
      'font-weight': 500,
      'fill': '#DF4F57'
    })

  const svg_g = svg
                  .selectAll('g')
                  .data([1, 2, 3, 4, 5])
                  .enter()
                  .append('g')
                  .attr('id', d=> `id${d}`)
                  .attr('transform', (d, i) => {
                    const xTrans = 20;
                    const yJump =  i;
                    return `translate(${xTrans}, ${yJump * (0.8*heightWM)})`;
                  });


  async function readAndDraw(){
    priceData = await d3.csv('Data/ButchPrice.csv');

    // filter to only non empty values of the variable
    priceData = priceData.filter(d => +d[varName] > 0);

    priceDataDIK = priceData.filter(d => d.District == "dik");
    priceDataKoh = priceData.filter(d => d.District == "kohistan");
    priceDataPesh = priceData.filter(d => d.District == "peshawar");
    priceDataAbb = priceData.filter(d => d.District == "abbottabad");


    // define the Histogram function
    const histogram = d3.histogram()
                        .value(function(d) { return +d[varName]; })   // I need to give the vector of value
                        .domain(x.domain())  // then the domain of the graphic
                        .thresholds(x.ticks(20));

    const binsOverall = histogram(priceData);

    const binsDIK = histogram(priceDataDIK);
    const binsKoh = histogram(priceDataKoh);
    const binsPesh = histogram(priceDataPesh);
    const binsAbb = histogram(priceDataAbb);

    y.domain([0, d3.max(binsOverall, function(d) { return (d.length/* lossData.length */); })]);


    function appendHist(id, binData, denom, color, textString, xAxis){
      const svgG = svg.select(`g#${id}`);

      svgG.selectAll("rect")
          .data(binData)
          .enter()
          .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + height + ")"; })
            .attr("width", d => d.length ? x(d.x1) - x(d.x0) - 1: 0)
            .attr("height", 0)
            .style("fill", color)
            .transition()
            .duration(1000)
            .attr("height", d => height - y(d.length/ denom))
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length/ denom) + ")"; });

      svgG.append('text')
        .attr('y', '0px')
        .attr('x', 30)
        .text(textString)
        .styles({
          'font-size': '12px',
          'text-anchor': 'middle',
          'fill': 'black',
          'font-family': "'Roboto Condensed', sans-serif",
          'font-weight': 300
        })

      if (xAxis == true){
        const axis = svgG.append("g")
        .attr('class', 'axis Bottom')
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

        axis.append('text')
            .text('Price per Kilogram (PKR)')
            .attr('y', '40px')
            .styles({
              'text-anchor': 'start',
              'fill': 'black'
            });
      }

      const yaxis = svgG.append("g")
      .attr('class', 'axis Left')
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisLeft(y).tickValues([0, 40, 80, 120]));

      yaxis.selectAll('text')
          .style('text-anchor', 'start')
    }


    const colArr = [
      '#beaed4',
      '#386cb0',
      '#f0027f'
    ];

    appendHist('id1', binsOverall, 1, colArr[0], "Overall", false);
    appendHist('id2', binsDIK, 1, colArr[1], "D.I.Khan", false);
    appendHist('id3', binsAbb, 1, colArr[1], "Abbottabad", false);
    appendHist('id4', binsPesh, 1, colArr[1], "Peshawar", false);
    appendHist('id5', binsKoh, 1, colArr[1], "Kohistan", true);


  }

  readAndDraw();
}
