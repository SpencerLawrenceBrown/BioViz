(function() {

	/* Chart Variables */
	//Sizing
	var svgWidth = 300;
	var pieWidth = 250;
	var barGraphSize = 200;
	var barGraphMargin = 20;
	var barGraphCanvas = barGraphSize + barGraphMargin*8
	var legendRectWidth = 10;
	var legendRectSpacing = 5;
	var mouseBuffer = 50;

	//Color
	var aliveColor = 'red';
	var deadColor = 'blue';

	//Base SVG elements
	var svg = d3.select("#chart")
		.append('svg')
		.attr('width', svgWidth)
		.attr('height', svgWidth)
		.append('g')
		.attr('transform', 'translate(' + (svgWidth/2) + "," + (pieWidth/2) + ')');

	var arc = d3.arc().innerRadius(0).outerRadius(pieWidth/2);

	var pie = d3.pie().value(function(d){ return d.count;}).sort(null);


	/*Helper Functions */
	/**
	 * basic stats model
	 * @param  {string} label 
	 * @param  {string} color 
	 * @return {stats instance} 
	 */
	function statsSet(label, color){

		this.count = 0;
		this.label = label;
		this.color = color;
		this.tissue = {}
		this.graphTitle = "% of TXdbid containing TCGA_" + this.label + " samples in different tissue types";
	
	}; //statsSet()


	/**
	 * toggles display of each graph
	 * @param  {element} el       selected element
	 * @param  {element} barGraph reference to parent of both graphs
	 */
	function displayGraph(el, barGraph){

		var graphToDisplay = "g." + d3.select(el).attr('data-graph');

		barGraph.select("g.shouldDisplay").classed('shouldDisplay', false);
		barGraph.select(graphToDisplay).classed('shouldDisplay', true);

	}; //displayGraph()

	/**
	 * Called for every id in data set
	 * If the id's contents should be added to the stat set, as determined by 'val', then adds id's contents 
	 * @param  {float} 		val     the stat specific determinant of whether the ID's frequencies should be counted for that stat (dead, alive)
	 * @param  {statsSet} 	stats   stats instance
	 * @param  {object} 	tissues object denoting if the id is present in different tissue types
	 */
	function updateStats(val, stats, tissues){

		if (val > 0){

			stats.count += val;

			for (tissue in tissues){

				if(!stats.tissue.hasOwnProperty(tissue)){
					stats.tissue[tissue] = 0;
				}

				if (tissues[tissue] == true){
					stats.tissue[tissue]++;
				}
			}
		}
	}; //updateStats()

	/**
	 * Takes in a data set and pulls the appropriate stats from it
	 * @param  {array} 	data 	data array created by D3
	 * @return {array}      	an array of the statsSet instances
	 */
	function analyzeDataSet(data){

		var aliveStats = new statsSet("Alive", aliveColor);
		var deadStats  = new statsSet("Dead", deadColor);

		data.forEach(function(d){
			
			var alivePer = parseFloat(d.TCGA_ALIVE);
			var deadPer  = parseFloat(d.TCGA_DEAD);
			var tempTissues = {};

			//Determine tissue types
			for (tissueType in d){
				if (tissueType.indexOf("GTEX") !== -1){
					tempTissues[tissueType] = (parseFloat(d[tissueType]) > 0);
				}
			}

			//Update the stats for the alive data and the dead data
			updateStats(parseFloat(d.TCGA_ALIVE), aliveStats, tempTissues);
			updateStats(parseFloat(d.TCGA_DEAD), deadStats, tempTissues);

		});


		//Create an array that is easy for d3 to iterate over
		return Array(aliveStats, deadStats);

	}; //analyzeDataSet()
	

	/* D3 SVG Build */
	d3.tsv('/data/TCGA_GTEX_DATA.txt', function(err, dataset){

		//Hide loader
		d3.select("#chart").classed("spinner", false);

		//Build states
		var totalStats = analyzeDataSet(dataset)

		//Build the scale function -- the range of values is dynamically updated for each graph.
		var x = d3.scaleBand()
			.rangeRound([0, barGraphSize])
			.align([0.5])
			.paddingInner([0.1])
			.paddingOuter([0.1]);

		var y = d3.scaleLinear()
			.range([barGraphSize, 0])
			.domain([0, dataset.length]);

		//The y-axis ticks should go from 0 -> 100. The values are are scaled accordingly by a function created when each graph is created.
		var yVizScale = d3.scaleLinear()
			.range([barGraphSize,0])
			.domain([0, 100]);

		//Creates both axes
		var xaxis = d3.axisBottom(x)
			.tickSizeInner(1)
			.tickSizeOuter(4)
		var yaxis = d3.axisLeft(yVizScale)
			.tickSizeInner(1)
			.tickSizeOuter(4)
			.ticks(4)

		//Change the colors of each bar in the graph -- they coordinate across all graphs
		var color = d3.scaleOrdinal(d3.schemeCategory10);

		//Build the graph container
		var bothGraphs = d3.select("#bar")
			.append('svg')
			.attr("width", barGraphCanvas)
			.attr("height", barGraphCanvas)
			.style("background-color", 'white')
			.style("border", "1px solid black");


		//Create the graph group for each statsSet Instance
		var barGraph = bothGraphs
			.selectAll('g')
			.data(totalStats)
			.enter()
			.each(function(d){
				//Create the correct amount of tissues
				x.domain(Object.keys(totalStats[0].tissue).map(function(k){
					return k
				}))
			})
			.append('g')
			.attr("class", function(d){return "barGraph " + d.label})
			.attr("transform", function(d,i){ return "translate(" + (barGraphCanvas/2 - barGraphSize/2)  + "," + barGraphMargin*2 + ")"});

		//Add a title to each graph
		barGraph.append('text')
			.text(function(d){return d.graphTitle})
			.attr("font-family", "sans-serif")
	        .attr("font-size", "10px")
	        .style("text-align", "center")
	        .style("font-weight", "bold")
	        .attr('transform',function(d){
	        	return "translate(" + -barGraphCanvas/6 + "," + (-15) + ")"; //This is just for centering
	        })

	    //Add the x-axis and rotate labels
		barGraph.append('g')
			.attr("transform", "translate(0," + (barGraphSize) + ")")
			.call(xaxis)
			.selectAll("text")	
	        .style("text-anchor", "end")
	        .attr("dx", "-.3em")
	        .attr("transform", function(d) {
	        	return "rotate(-70)" 
	        });

	    //Simple y-axis
		barGraph.append('g')
			.attr("transform", "translate(" + 0 + "," + "0)")
			.call(yaxis);
			
		//Add label to y-axis
		barGraph.append("text")
            .attr("text-anchor", "middle") 
            .attr("font-size", "12px")
            .attr("transform", "translate("+ -barGraphSize/8 +","+(barGraphSize/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Frequency"); //y-axis label


        //Create all the bars in each graph
		barGraph.selectAll("bar")
			.data(function(d){
				//Create a y scale function per each data point -- this ensures that each graph's max value is determined by the statsSets totalIds count
				// var scaleFunction = d3.scaleLinear()
				// 	.range([barGraphSize, 0])
				// 	.domain([0, d.totalIds]);

				// return Object.keys(d.tissue).map(function(k){return {"name": k , "value": d.tissue[k], "total": d.totalIds, "scale" : scaleFunction}})
				return Object.keys(d.tissue).map(function(k){return {"name": k , "value": d.tissue[k]}})
			})
			.enter()
			.append("g")
			.append("rect")
			.attr('x', function(d,i){return x(d.name)})
			.attr('width', function(d){return x.bandwidth()})
			.attr('y', function(d){return(y(d.value))})
			.attr('height', function(d){ return barGraphSize - y(d.value)})
			.style('fill', function(d,i){return color(i)});

		//Build the pie chart
		var path = svg.selectAll('path')
			.data(pie(totalStats))
			.enter()
			.append('path')
			.attr('class', 'slice')
			.attr('data-graph', function(d){return d.data.label})
			.attr('d', arc)
			.attr('fill', function(d,i){
				return d.data.color;
			});

		//Build the legend
		var legend = svg.selectAll('.legend')
			.data(totalStats)
			.enter()
			.append('g')
			.attr('class', 'legend')
			.attr('transform', function(d,i){
				var height = legendRectWidth + legendRectSpacing;
				var offset = height * totalStats.length / 2;
				var horz = 0;
				var vert = pieWidth/2 + 5 + legendRectWidth * i + legendRectSpacing * i;
				return 'translate(' + horz + ',' + vert + ')';
			});

		legend.append("rect")
			.attr('width', 10)
			.attr('height', 10)
			.style('fill', function(d){return d.color;})

		legend.append("text")
			.attr('x', legendRectWidth + legendRectSpacing)
			.attr('y', legendRectWidth)
			.text(function(d){return d.label;});
		
		//Mouse events
		path.on('mousemove', function(d){

			//Update the location of the graph to follow the mouse
			d3.select('#bar')
				.style('top', (d3.event.layerY + mouseBuffer) + 'px')
				.style('left', (d3.event.layerX + barGraphSize) + 'px')
				d3.select('#bar').style('display', 'block');

			//update the appropriate classes to ensure the correct graph is displayed
			displayGraph(this, bothGraphs);

			//Light highlight of the section of the pie currently being graphed
			d3.select(this).style('stroke', 'black')

		});

		//Hide graph and highlight when the mouse is not hovering
		path.on('mouseout', function(d){

			d3.select('#bar').style('display', 'none');
			d3.select(this).style('stroke', 'transparent');

		});

	}); //d3.tsv()

})();