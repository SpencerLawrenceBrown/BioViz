(function() {

	var legend = {
		"Male" : "blue",
		"Female" : "red",
		"Both" : "block"
	};

	var graphHeight = 500;

	var barWidth = 3;
	var barHeight = 50;
	var barPadding = 1;

	var femaleColor = legend["Female"];
	var maleColor = legend["Male"];

	var legendRectSize = 10;
	var legendPaddingSize = 5;
	var legendTextMargin = 40;
	var legendHeight = legendRectSize + legendPaddingSize * 2;
	var legendLabelIndex = 0;
	var legendColorIndex = 1;

	function updateTooltip(el, d){
		for (property in d){
			tooltip.select('.' + property).html("<p>" + property + ": " + d[property] + "</p>");
		}
		tooltip.style('display', 'block');

		//update selected viz
		var selected = svg.selectAll(".selected")
			.classed('selected', false)

		d3.select(el)
			.classed('selected', true)

	};
	function addHighlight(el){
		d3.select(el)
		.classed('highlighted', true)
	};
	function removeHighlight(el){
		d3.select(el)
		.classed('highlighted', false)
	};


	var svg = d3.select("#oncograph")
		.append('svg')
		.attr('height', barHeight);

	var tooltip = d3.select('#oncograph')
	.append('div')
	.attr('class', 'tooltip');

	var legend = tooltip.append('svg')
		.attr('class', 'legend')
		.attr('height', legendHeight)
		.selectAll('p')
		.data(Object.keys(legend).map(function(k){return [k , legend[k]]}))
		.enter()
		.append('g')
		.attr('class', 'legendValue')
		.attr('transform', function(d,i){
			var left = i * (legendRectSize + legendPaddingSize + legendTextMargin);
			var top  = legendPaddingSize;
			return 'translate(' + left + ',' + top + ')';
		});
	
	legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', function(d){return d[legendColorIndex]});

	legend.append('text')
		.attr('x', legendRectSize + legendPaddingSize)
		.attr('y', legendRectSize)
		.text(function(d){return d[legendLabelIndex]});

	tooltip.append('div')
	.attr('class', 'ID');

	tooltip.append('div')
	.attr('class', 'GENE');

	tooltip.append('div')
	.attr('class', 'ENSEMBLE');

	d3.tsv('TCGA_GTEX_DATA.txt', function(err, dataset){
		//Set the width of the svg
		var svgWidth = dataset.length * barWidth + dataset.length * barPadding + 10;
		svg.attr('width', svgWidth);

		var onco = svg.selectAll('rect')
		.data(dataset)
		.enter()
		.append('g')
		.append('rect')
		.attr('width', barWidth)
		.attr('height', barHeight)
		.attr('x', function(d,i){ return barWidth * i + barPadding * i})
		.style('fill', function(d){
			if (d.TCGA_AML_FEMALE == 0){
				return maleColor
			} else if (d.TCGA_AML_MALE == 0){
				return femaleColor
			} else {
				return "black"
			}
		});

		onco.on('mouseover', function(d){
			addHighlight(this);
		});

		onco.on('mouseout', function(d){
			removeHighlight(this);
		});

		onco.on('mousedown', function(d){
			updateTooltip(this, d)
		});
	});

})();