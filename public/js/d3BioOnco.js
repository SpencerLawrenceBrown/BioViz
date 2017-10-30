(function() {

	/* Chart Variables */
	//Set legend and onco colors
	var legend = {
		"Male" : "blue",
		"Female" : "red",
		"Both" : "block"
	};
	var femaleColor = legend["Female"];
	var maleColor = legend["Male"];

	//Sizing
	var graphHeight = 500;

	var barWidth = 3;
	var barHeight = 50;
	var barPadding = 1;

	var legendRectSize = 10;
	var legendPaddingSize = 5;
	var legendTextMargin = 40;
	var legendHeight = legendRectSize + legendPaddingSize * 2;
	var legendLabelIndex = 0;
	var legendColorIndex = 1;


	/*Base SVG Elements*/
	//SVG base
	var svg = d3.select("#oncograph")
		.append('svg')
		.attr('height', barHeight);

	//Info display
	var info = d3.select('#oncograph')
		.append('div')
		.attr('class', 'info');

	//Oncograph legend
	var legend = info.append('svg')
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
	
	//Create each color rect
	legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', function(d){return d[legendColorIndex]});
	legend.append('text')
		.attr('x', legendRectSize + legendPaddingSize)
		.attr('y', legendRectSize)
		.text(function(d){return d[legendLabelIndex]});

	//Add the properties that should appear when an id is selected
	info.append('div')
		.attr('class', 'ID');
	info.append('div')
		.attr('class', 'GENE');
	info.append('div')
		.attr('class', 'ENSEMBLE');


	/*Helper Functions*/
	/**
	 * Updates the information in the info section
	 * @param  {element} el 	selected element
	 * @param  {d3 data} d  	element data passed in by D3
	 */
	function updateInfo(el, d){

		for (property in d){ //easy to add new data properties
			
			info.select('.' + property).html("<p>" + property + ": " + d[property] + "</p>");

		}

		//Show tool tip
		info.style('display', 'block');

		//update classes for appropriate display
		var selected = svg.selectAll(".selected")
			.classed('selected', false);

		d3.select(el)
			.select(function() {return el.parentNode})
			.select('.highlight')
			.classed('selected', true);

	}; //updateInfo()


	/**
	 * manages highlight classes
	 * @param  {element} el 	selected element
	 */
	function addHighlight(el){

		d3.select(el)
			.select(function() {return el.parentNode})
			.select('.highlight')
			.classed('highlighted', true);

	}; //addHighlight()
	function removeHighlight(el){

		d3.select(el)
			.select(function() {return el.parentNode})
			.select('.highlight')
			.classed('highlighted', false);

	}; //removeHighlight()


	/* D3 SVG Build */
	d3.tsv('/data/TCGA_GTEX_DATA.txt', function(err, dataset){

		//Remove loader
		d3.select("#oncograph").classed("spinner", false);

		//Sort
		dataset.sort(function(x,y){
			return x.TCGA_AML_FEMALE - y.TCGA_AML_FEMALE;
		});

		//Set the width of the svg based on the number of items in the data set -- plus 10 just leaves a little buffer at the end
		var svgWidth = dataset.length * barWidth + dataset.length * barPadding + 10;
		svg.attr('width', svgWidth);

		//Build the Oncograph
		var onco = svg.selectAll('rect')
		.data(dataset)
		.enter()
		.append('g')

		var bars = onco.append('rect')
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

		onco.append('rect')
			.attr('width', barWidth)
			.attr('height', 2)
			.attr('x', function(d,i){ return barWidth * i + barPadding * i})
			.attr('y', function(d){ return barHeight - 2})
			.attr('class', 'highlight');

		//Mouse events
		bars.on('mouseover', function(d){
			addHighlight(this);
		});
		bars.on('mouseout', function(d){
			removeHighlight(this);
		});
		bars.on('mousedown', function(d){
			updateInfo(this, d)
		});

	}); //d3.tsv()
})();