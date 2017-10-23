(function() {

	var dataset = [
		{ "ID": "CA-CS-19-58352282-58352555.8367.1", "GENE": "A1BG", "ENSEMBLE": "ENST00000600966.1", "TCGA_AML_FEMALE": "100", "TCGA_AML_MALE": "0", "TCGA_DEAD": "0", "TCGA_ALIVE": "100", "GTEX_BLOOD": "0", "GTEX_BLOOD_VESSEL": "0.4", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "0" },
		{ "ID": "CA-CS-19-58353713-58353857.7507.0", "GENE": "A1BG-AS1", "ENSEMBLE": "ENST00000600379.5", "TCGA_AML_FEMALE": "83.3333333333333", "TCGA_AML_MALE": "16.6666666666667", "TCGA_DEAD": "66.6666666666667", "TCGA_ALIVE": "33.3333333333333", "GTEX_BLOOD": "2.31075697211155", "GTEX_BLOOD_VESSEL": "12.8", "GTEX_BONE_MARROW": "17.5438596491228", "GTEX_MUSCLE": "0.842105263157895" },
		{ "ID": "CA-CA-12-9112158-9112211.845.0", "GENE": "A2M", "ENSEMBLE": "XM_006719056.2", "TCGA_AML_FEMALE": "31.25", "TCGA_AML_MALE": "68.75", "TCGA_DEAD": "68.75", "TCGA_ALIVE": "31.25", "GTEX_BLOOD": "1.83266932270916", "GTEX_BLOOD_VESSEL": "42.1333333333333", "GTEX_BONE_MARROW": "1.75438596491228", "GTEX_MUSCLE": "25.8947368421053" },
		{ "ID": "CA-CA-12-9065825-9066060.10441.0", "GENE": "A2M-AS1", "ENSEMBLE": "ENST00000499762.2", "TCGA_AML_FEMALE": "38.0952380952381", "TCGA_AML_MALE": "61.9047619047619", "TCGA_DEAD": "71.4285714285714", "TCGA_ALIVE": "28.5714285714286", "GTEX_BLOOD": "0.318725099601594", "GTEX_BLOOD_VESSEL": "36.1333333333333", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "6.31578947368421" }
	];

	var svgWidth = 300;
	var pieWidth = 250;
	var legendRectWidth = 10;
	var legendRectSpacing = 5;

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

	var aliveStats = {};
	aliveStats.count = 0;
	aliveStats.label = "Alive";
	aliveStats.color = "red"
	var deadStats = {};
	deadStats.count = 0;
	deadStats.label = "Dead";
	deadStats.color = "blue";

	dataset.forEach(function(d){
		aliveStats.count += parseFloat(d.TCGA_ALIVE)
		deadStats.count += parseFloat(d.TCGA_DEAD)
	});

	var totalStats = [];
	totalStats.push(aliveStats);
	totalStats.push(deadStats);

	console.log(totalStats)

	var path = svg.selectAll('path')
		.data(pie(totalStats))
		.enter()
		.append('path')
		.attr('class', 'slice')
		.attr('d', arc)
		.attr('fill', function(d,i){
			if (i == 0){
				return "red";
			} else {
				return "blue";
			}
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


	// d3.tsv('TCGA_GTEX_DATA.txt', function(err, dataset){

		// var item = svgImage.selectAll('rect')
		// .data(dataset)
		// .enter()
		// .append('g')
		// .append('rect')
		// .attr('width', barWidth)
		// .attr('height', barHeight)
		// .attr('x', function(d,i){ return barWidth * i + barPadding * i})
		// .style('fill', function(d){
		// 	if (d.TCGA_AML_MALE > 0){
		// 		return maleColor
		// 	} else {
		// 		return "grey"
		// 	}
		// })
		// .select(function() {return this.parentNode})
		// .append("rect")
		// .attr('width', barWidth)
		// .attr('height', barHeight/2)
		// .attr('x', function(d,i){ return barWidth * i + barPadding * i})
		// .attr('y', function(d){ return barHeight / 4})
		// .style('fill', function(d){
		// 	if (d.TCGA_AML_FEMALE > 0){
		// 		return femaleColor
		// 	} else {
		// 		return "transparent"
		// 	}
		// })
		// .select(function() {return this.parentNode});

	// });

})();