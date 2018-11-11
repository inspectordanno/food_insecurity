d3.csv('../data/food_insecurity.csv', d => {
    if (d.nhd != '') {
      return {
        neighborhood: d.nhd,
        population: +d.pop,
        poverty_rate: +d.pov_p,
        food_insecure: +d.fi_num,
        unemployed: +d.unemp_p
      };
    }
  }).then(data =>{
    const neighborhoods = d3.nest()
      .key(d => d.neighborhood)
      .rollup(values => {
        return {
          population: Math.round(d3.sum(values, function(d){return d.population})),
          poverty_rate: d3.format(".3n")(d3.mean(values, function(d){return d.poverty_rate})),
          food_insecure: d3.format(".3n")(d3.mean(values, function(d){return d.food_insecure})),
          unemployed: d3.format(".3n")(d3.mean(values, function(d){return d.unemployed}))
        };
      })
      .entries(data);

      console.log(neighborhoods)

      const consolidated_data = neighborhoods.map(d => {
        return {
          neighborhood: d.key,
          population: d.value.population,
          avg_poverty_rate: +d.value.poverty_rate,
          avg_food_insecure: +d.value.food_insecure,
          avg_unemployed: +d.value.unemployed
        };
      });
      console.log(consolidated_data);

      const width = 1200;
      const height = width/1.4

      const svg = d3.select('#svg_container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background-color', 'steelblue')
      .append('g')
      .attr('transform', 'translate(0,0)')

      //scales

      const radiusScale = d3.scaleSqrt().domain([5000, 120000]).range([8,60]);

      const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([250, 1000])

      //the simulation is a collection of forces 
      //about where we want our forcs to go and how
      //we want our forces to interact
      //step one: get them to the middle
      //step two: don't have them collide

      const forceXSeparate = d3.forceX(d => {
        if (d.avg_unemployed < 5) {
          return 200;
        } else {
          return 800;
        }
      });

      const forceXCombine = d3.forceX(width/2).strength(0.05);

      const forceCollide = d3.forceCollide(d => {
        return radiusScale(d.population) + 20;
      });

      let simulation = d3.forceSimulation()
        .force('x', forceXCombine)
        .force('y', d3.forceY(height / 2).strength(0.05))
        .force('collide', forceCollide);

      const circles = svg.selectAll('.neighborhoods')
        .data(consolidated_data)
        .enter()
        .append('circle')
        .attr('class', 'neighborhood')
        .attr('r', d => radiusScale(d.population))
        .attr('fill', d => colorScale(d.avg_food_insecure))
        .attr('id', d => d.neighborhood)
      
      const labels = svg.selectAll(null)
      .data(consolidated_data)
      .enter()
      .append('text')
      .text(d => d.neighborhood)
      .style("text-anchor", "middle")
      .style("fill", d => d.avg_food_insecure > 500 ? 'white':'#333')
      .style("font-family", "Arial")
      .style("font-size", 16);

      //buttons
      d3.select('#five')
      .on('click', d => {
        simulation
          .force('x', forceXSeparate)
          .alphaTarget(0.5)
          .restart();
        console.log('five');
      });

      d3.select('#seven_five')
      .on('click', d => {
        console.log('five');
      })

      d3.select('#ten')
      .on('click', d => {
        console.log('five');
      });

      d3.select('#combine')
      .on('click', d => {
        simulation
          .force('x', forceXCombine)
          .alphaTarget(0.5)
          .restart();
      });
  
      simulation.nodes(consolidated_data)
        .on('tick', ticked);

      function ticked() {
        circles
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        
        labels
          .attr('x', d => d.x)
          .attr('y', d => d.y)
      }

  });