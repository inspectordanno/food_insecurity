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

      const consolidated_data = neighborhoods.map(d => {
        return {
          neighborhood: d.key,
          population: d.value.population,
          avg_poverty_rate: +d.value.poverty_rate,
          avg_food_insecure_rate: +d.value.food_insecure
        };
      });
      console.log(consolidated_data);

      const width = 500;
      const height = 500;

      const svg = d3.select('#svg_container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background-color', 'lightgray')
      .append('g')
      .attr('transform', 'translate(0,0)')

      const radiusScale = d3.scaleSqrt().domain([5000, 120000]).range([10,80]);

      const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([5, 50])

      //the simulation is a collection of forces 
      //about where we want our forcs to go and how
      //we want our forces to interact
      //step one: get them to the middle
      //step two: don't have them collide
      const simulation = d3.forceSimulation()
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05))
        .force('collide', d3.forceCollide(d => {
          return radiusScale(d.population) + 1;
        }))

      const circles = svg.selectAll('.neighborhoods')
        .data(consolidated_data)
        .enter()
        .append('circle')
        .attr('class', 'neighborhood')
        .attr('r', d => radiusScale(d.population))
        .attr('fill', d => colorScale(d.avg_poverty_rate))
        .on('click', d => console.log(d))

      simulation.nodes(consolidated_data)
        .on('tick', ticked);

      function ticked() {
        circles
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
      }
  });