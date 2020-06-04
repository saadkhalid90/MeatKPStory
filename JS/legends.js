function makeNestCircLegend(CSSSelect = 'svg', transformArray, bubArray, bubScale, legendTitle, col = 'black', dy = 40){
  // appending a legendgroup
  let legendGroup = d3.select(CSSSelect)
                   .append('g')
                   .classed('circLegGroup', true)
                   .attr('transform', `translate(${transformArray[0]}, ${transformArray[1]})`);

  const textSelect = legendGroup.append('text')
           //.text(legendTitle)
           .classed('legendTitle', true)
           .attr('dy', dy)
           .style('font-size', '9px')
           .style('text-anchor', 'middle')
           .style('fill', col)

  if (typeof legendTitle == "string"){
    textSelect.text(legendTitle)
  }
  else {
    textSelect.selectAll('tspan')
            .data(legendTitle)
            .enter()
            .append('tspan')
            .text(d => d)
            .attr('x', 0)
            .attr('dy', (d, i) => i == 0 ? `${dy}px` : `13px`)
            //.style('text-anchor', 'middle');
  }

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
           .style('stroke', col)
           .style('fill', 'none')
           .style('stroke-width', '1px');

  circGroups.append('text')
           .text(d => d)
           .attr('dx', radius + legLabelPadding)
           .attr('dy', d => -(bubScale(d) - legLabFontSize/2))
           .style('fill', col)
           .style('font-size', `${legLabFontSize}px`)
           .style('font-family', 'Open Sans');

}

function drawContLegend(selector, position, minScale, maxScale, colorArr, textCol, legTitle) {

    let rectWidth = 100;
    let rectHeight = 5;

    let barG = selector.append('g')
                        .attr('class', 'contLegGroup')
                        .attr('transform', `translate(${position[0]}, ${position[1]})`);



    var linGrad = barG.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient2")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    linGrad.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorArr[0])
        .attr("stop-opacity", 1);

    linGrad.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", 'white')
        .attr("stop-opacity", 1);

    linGrad.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorArr[1])
        .attr("stop-opacity", 1);

    barG.append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('rx', 2)
        .attr('ry', 2)
        .style("fill", "url(#gradient2)")
    //.style('stroke', '#212121')
    //  .style('stroke-width', '0.5px')

    barG.selectAll('text')
        .data([minScale, 50, maxScale])
        .enter()
        .append('text')
        .text((d, i) => d + '%')
        .attr('transform', (d, i) => i == 0 ? `translate(0, 15)` : `translate(${(i/2 * 100)}, 15)`)
        .style('text-anchor', 'start')
        .style('fill', textCol)
        .style('font-size', '8px');

    let legendTitle = barG.append('text')
                          .attr('class', 'legendTitle')
                          .text(legTitle)
                          .attr('transform', 'translate(' + 0 + ',' + (-10) + ')')
                          .style('fill', textCol)
                          .style('font-size', '9px');

}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
