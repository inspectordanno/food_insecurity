d3.csv('../data/food_insecurity.csv', d => {
    if (d.nhd != '') {
      return {
        neighborhood: d.nhd,
        poverty_rate: +d.pov_p,
        food_insecure: +d.fi_num
      };
    }
  }).then(data =>{
    const neighborhoods = d3.nest()
      .key(d => d.neighborhood)
      .rollup(values => {
        return {
          poverty_rate: d3.format(".3n")(d3.mean(values, function(d){return d.poverty_rate})),
          food_insecure: Math.round(d3.mean(values, function(d){ return d.food_insecure }))
        };
      })
      .entries(data);

      const consolidated = neighborhoods.map(d => {
        return {
          neighborhood: d.key,
          avg_poverty_rate: +d.value.poverty_rate,
          avg_food_insecure_individuals: d.value.food_insecure
        };
      });
      console.log(consolidated);

      const diameter = 600;

      d3.select('#svg_container')
        .append('svg')
        .attr('width', diameter)
        .attr('height', diameter)

  });