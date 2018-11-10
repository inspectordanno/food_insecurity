d3.csv('../data/food_insecurity.csv', d => {
    if (d.nhd != '') {
      return {
        neighborhood: d.nhd,
        poverty_rate: +d.pov_p,
        food_insecure: +d.fi_p
      };
    }
  }).then(data =>{
    const neighborhoods = d3.nest()
      .key(d => d.neighborhood)
      .rollup(values => {
        return {
          poverty_rate: d3.format(".3n")(d3.mean(values, function(d){return d.poverty_rate})),
          food_insecure: d3.format(".3n")(d3.mean(values, function(d){return d.food_insecure}))
        };
      })
      .entries(data);

      const consolidated_data = neighborhoods.map(d => {
        return {
          neighborhood: d.key,
          avg_poverty_rate: +d.value.poverty_rate,
          avg_food_insecure_rate: +d.value.food_insecure
        };
      });
      console.log(consolidated_data);

      //help from https://bl.ocks.org/alokkshukla/3d6be4be0ef9f6977ec6718b2916d168

      const diameter = 600;
      const color = d3.scaleSequential(d3.schemeRdYlGn);
      const bubble = d3.pack(consolidated_data)
        .size([diameter, diameter])
        .padding(1.5);

      d3.select('#svg_container')
        .append('svg')
        .attr('width', diameter)
        .attr('height', diameter)

  });