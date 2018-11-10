d3.csv('../data/food_insecurity.csv', d => {
    if (d.nhd != '') {
      return {
        neighborhood: d.nhd,
        population: +d.pop,
        poverty_rate: +d.pov_p,
        food_insecure: +d.fi_p
      };
    }
  }).then(data =>{
    const neighborhoods = d3.nest()
      .key(d => d.neighborhood)
      .rollup(values => {
        return {
          population: Math.round(d3.sum(values, function(d){return d.population})),
          poverty_rate: d3.format(".3n")(d3.mean(values, function(d){return d.poverty_rate})),
          food_insecure: d3.format(".3n")(d3.mean(values, function(d){return d.food_insecure}))
        };
      })
      .entries(data);

      console.log(neighborhoods);

      const consolidated_data = neighborhoods.map(d => {
        return {
          neighborhood: d.key,
          population: d.value.population,
          avg_poverty_rate: +d.value.poverty_rate,
          avg_food_insecure_rate: +d.value.food_insecure
        };
      });
      console.log(consolidated_data);

      const obj = {name: 'neighborhoods', children:[]}
      for(i=0; i < consolidated_data.length; i++){
        obj.children.push({
          name: consolidated_data[i].neighborhood,
          children: consolidated_data[i]
        })
      }
      console.log(obj)

      //help from https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168
      const diameter = 600;
      const color = d3.scaleSequential(d3.schemeRdYlGn);
      const bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);

      const circlePositions = {};

      const svg = d3.select('#svg_container')
        .append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .attr('class', 'bubble')

      const nodes = d3.hierarchy(obj)
        .sum(d => d.population)

      const node = svg.selectAll('.node')
        .data(bubble(nodes).descendants())
        .enter()
        .append('g')
        //.attr('class', 'node')
        .attr('class', d => {
          console.log(d)
          circlePositions[d.data.name] = {x: d.x, y:d.y}
          return d.children ? 'node' : 'leaf node';
        })
        .attr('transform', d =>{
          circlePositions[d.data.name] = {x: d.x, y:d.y}
          return `translate(${d.x},${d.y})`
        })

      node.append('title')
        .text(d => {
          return `${d.neighborhood}:${d.population}`
        });

      node.append('circle')
        .attr('r', d => d.r)
        .style('fill', d => color(d.population));
  });