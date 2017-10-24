(function() {

	// var dataset = [
	// 	{ "ID": "CA-CS-19-58352282-58352555.8367.1", "GENE": "A1BG", "ENSEMBLE": "ENST00000600966.1", "TCGA_AML_FEMALE": "100", "TCGA_AML_MALE": "0", "TCGA_DEAD": "0", "TCGA_ALIVE": "100", "GTEX_BLOOD": "0", "GTEX_BLOOD_VESSEL": "0.4", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "0" },
	// 	{ "ID": "CA-CS-19-58353713-58353857.7507.0", "GENE": "A1BG-AS1", "ENSEMBLE": "ENST00000600379.5", "TCGA_AML_FEMALE": "83.3333333333333", "TCGA_AML_MALE": "16.6666666666667", "TCGA_DEAD": "66.6666666666667", "TCGA_ALIVE": "33.3333333333333", "GTEX_BLOOD": "2.31075697211155", "GTEX_BLOOD_VESSEL": "12.8", "GTEX_BONE_MARROW": "17.5438596491228", "GTEX_MUSCLE": "0.842105263157895" },
	// 	{ "ID": "CA-CA-12-9112158-9112211.845.0", "GENE": "A2M", "ENSEMBLE": "XM_006719056.2", "TCGA_AML_FEMALE": "31.25", "TCGA_AML_MALE": "68.75", "TCGA_DEAD": "68.75", "TCGA_ALIVE": "31.25", "GTEX_BLOOD": "1.83266932270916", "GTEX_BLOOD_VESSEL": "42.1333333333333", "GTEX_BONE_MARROW": "1.75438596491228", "GTEX_MUSCLE": "25.8947368421053" },
	// 	{ "ID": "CA-CA-12-9065825-9066060.10441.0", "GENE": "A2M-AS1", "ENSEMBLE": "ENST00000499762.2", "TCGA_AML_FEMALE": "38.0952380952381", "TCGA_AML_MALE": "61.9047619047619", "TCGA_DEAD": "71.4285714285714", "TCGA_ALIVE": "28.5714285714286", "GTEX_BLOOD": "0.318725099601594", "GTEX_BLOOD_VESSEL": "36.1333333333333", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "6.31578947368421" }
	// ];

	var svgWidth = 300;
	var pieWidth = 250;
	var barGraphSize = 200;
	var barGraphMargin = 20;
	var barGraphCanvas = barGraphSize + barGraphMargin*8
	var legendRectWidth = 10;
	var legendRectSpacing = 5;
	var mouseBuffer = 50;

	var aliveColor = 'red';
	var deadColor = 'blue';

	var svg = d3.select("#chart")
		.append('svg')
		.attr('width', svgWidth)
		.attr('height', svgWidth)
		.append('g')
		.attr('transform', 'translate(' + (pieWidth/2) + "," + (pieWidth/2) + ')');

	var arc = d3.arc().innerRadius(0).outerRadius(pieWidth/2);

	var pie = d3.pie().value(function(d){ return d.count;}).sort(null);

	function statsSet(label, color){
		this.count = 0;
		this.totalIds = 0;
		this.label = label;
		this.color = color;
		this.tissue = {}
		this.graphTitle = "% of TXdbid containing TCGA_" + this.label + " samples in different tissue types";
	};

	function displayGraph(el, barGraph){

		var graphToDisplay = "g." + d3.select(el).attr('data-graph');

		barGraph.select("g.shouldDisplay").classed('shouldDisplay', false);
		barGraph.select(graphToDisplay).classed('shouldDisplay', true);

	}

	function updateStats(val, stats, tissues){
		if (val > 0){
			stats.count += val;
			stats.totalIds += 1;

			for (tissue in tissues){
				if(!stats.tissue.hasOwnProperty(tissue)){
					stats.tissue[tissue] = 0;
				}
				if (tissues[tissue] == true){
					stats.tissue[tissue]++;
				}
			}
		}
	}

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

	}

	d3.tsv('TCGA_GTEX_DATA.txt', function(err, dataset){

		var totalStats = analyzeDataSet(dataset)

		//Build the scale functions -- the range of value is dynamically updated for each graph.
		var x = d3.scaleBand()
			.rangeRound([0, barGraphSize])
			.align([0.5])
			.paddingInner([0.1])
			.paddingOuter([0.1]);

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

		//Change the colors of each bar in the graph -- they coordinate across the dead and alive graph
		var color = d3.scaleOrdinal(d3.schemeCategory10);

		//Build the graph container
		var bothGraphs = d3.select("#bar")
			.append('svg')
			.attr("width", barGraphCanvas)
			.attr("height", barGraphCanvas)
			.style("background-color", 'white')
			.style("border", "1px solid black");


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
	        .attr('transform',function(d){
	        	return "translate(" + -barGraphCanvas/6 + "," + (-15) + ")"; 
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
			
		//Add title to y-axis
		barGraph.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is 
            .attr("font-size", "12px")
            //applied to the anchor
            .attr("transform", "translate("+ -barGraphSize/8 +","+(barGraphSize/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Frequency");


		barGraph.selectAll("bar")
			.data(function(d){
				//Create a y scale function per each data point
				var scaleFunction = d3.scaleLinear()
					.range([barGraphSize, 0])
					.domain([0, d.totalIds])
				return Object.keys(d.tissue).map(function(k){return {"name": k , "value": d.tissue[k], "total": d.totalIds, "scale" : scaleFunction}})})
			.enter()
			.append("g")
			.append("rect")
			.attr('x', function(d,i){return x(d.name)})
			.attr('width', function(d){return x.bandwidth()})
			.attr('y', function(d){return(d.scale(d.value))})
			.attr('height', function(d){ return barGraphSize - d.scale(d.value)})
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

		path.on('mousemove', function(d){

			//Update the movement of the graph
			d3.select('#bar')
				.style('top', (d3.event.layerY + mouseBuffer) + 'px')
				.style('left', (d3.event.layerX + barGraphSize) + 'px')
				d3.select('#bar').style('display', 'block');

			//update the appropriate classes to display
			displayGraph(this, bothGraphs);

			d3.select(this).style('stroke', 'black')
		});

		path.on('mouseout', function(d){
			d3.select('#bar').style('display', 'none');
			d3.select(this).style('stroke', 'transparent');
		});

	});

})();