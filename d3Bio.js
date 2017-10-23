(function() {

	// var testData = [
	// 	{ "ID": "CA-CS-19-58352282-58352555.8367.1", "GENE": "A1BG", "ENSEMBLE": "ENST00000600966.1", "TCGA_AML_FEMALE": "100", "TCGA_AML_MALE": "0", "TCGA_DEAD": "0", "TCGA_ALIVE": "100", "GTEX_BLOOD": "0", "GTEX_BLOOD_VESSEL": "0.4", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "0" },
	// 	{ "ID": "CA-CS-19-58353713-58353857.7507.0", "GENE": "A1BG-AS1", "ENSEMBLE": "ENST00000600379.5", "TCGA_AML_FEMALE": "83.3333333333333", "TCGA_AML_MALE": "16.6666666666667", "TCGA_DEAD": "66.6666666666667", "TCGA_ALIVE": "33.3333333333333", "GTEX_BLOOD": "2.31075697211155", "GTEX_BLOOD_VESSEL": "12.8", "GTEX_BONE_MARROW": "17.5438596491228", "GTEX_MUSCLE": "0.842105263157895" },
	// 	{ "ID": "CA-CA-12-9112158-9112211.845.0", "GENE": "A2M", "ENSEMBLE": "XM_006719056.2", "TCGA_AML_FEMALE": "31.25", "TCGA_AML_MALE": "68.75", "TCGA_DEAD": "68.75", "TCGA_ALIVE": "31.25", "GTEX_BLOOD": "1.83266932270916", "GTEX_BLOOD_VESSEL": "42.1333333333333", "GTEX_BONE_MARROW": "1.75438596491228", "GTEX_MUSCLE": "25.8947368421053" },
	// 	{ "ID": "CA-CA-12-9065825-9066060.10441.0", "GENE": "A2M-AS1", "ENSEMBLE": "ENST00000499762.2", "TCGA_AML_FEMALE": "38.0952380952381", "TCGA_AML_MALE": "61.9047619047619", "TCGA_DEAD": "71.4285714285714", "TCGA_ALIVE": "28.5714285714286", "GTEX_BLOOD": "0.318725099601594", "GTEX_BLOOD_VESSEL": "36.1333333333333", "GTEX_BONE_MARROW": "0", "GTEX_MUSCLE": "6.31578947368421" }
	// ];

	function updateTooltip(d){
		for (property in d){
			tooltip.select('.' + property).html("<p>" + property + ": " + d[property] + "</p>");
		}
		tooltip.style('display', 'block');
	};

	function addHighlight(el){
		d3.select(el)
		.style('stroke', 'black');
	}

	function removeHighlight(el){
		d3.select(el)
		.style('stroke', 'transparent');
	}

	var graphHeight = 500;

	var barWidth = 3;
	var barHeight = 100;
	var barPadding = 1;

	var femaleColor = 'red';
	var maleColor = 'blue';



	var svgImage = d3.select("#oncograph")
		.append('svg')
		.attr('height', barHeight);

	var svgLegend = d3.select("#oncograph")
		.append('svg')
		.attr('height', barHeight);

	var svgRatio = d3.select("#oncograph")
		.append('svg')
		.attr('height', barHeight);

	var tooltip = d3.select('#oncograph')
	.append('div')
	.attr('class', 'tooltip');

	tooltip.append('div')
	.attr('class', 'ID');

	tooltip.append('div')
	.attr('class', 'GENE');

	tooltip.append('div')
	.attr('class', 'ENSEMBLE');
	
	tooltip.append('div')
	.attr('class', 'TCGA_AML_MALE');
	
	tooltip.append('div')
	.attr('class', 'TCGA_AML_FEMALE');

	d3.tsv('TCGA_GTEX_DATA.txt', function(err, dataset){
		//Set the width of the svg
		var svgWidth = dataset.length * barWidth + dataset.length * barPadding + 10;
		svgImage.attr('width', svgWidth);
		svgLegend.attr('width', svgWidth);
		svgRatio.attr('width', svgWidth);


		var item = svgImage.selectAll('rect')
		.data(dataset)
		.enter()
		.append('g')
		.append('rect')
		.attr('width', barWidth)
		.attr('height', barHeight)
		.attr('x', function(d,i){ return barWidth * i + barPadding * i})
		.style('fill', function(d){
			if (d.TCGA_AML_MALE > 0){
				return maleColor
			} else {
				return "grey"
			}
		})
		.select(function() {return this.parentNode})
		.append("rect")
		.attr('width', barWidth)
		.attr('height', barHeight/2)
		.attr('x', function(d,i){ return barWidth * i + barPadding * i})
		.attr('y', function(d){ return barHeight / 4})
		.style('fill', function(d){
			if (d.TCGA_AML_FEMALE > 0){
				return femaleColor
			} else {
				return "transparent"
			}
		})
		.select(function() {return this.parentNode});

		var second = svgLegend.selectAll('rect')
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

		var third = svgRatio.selectAll('rect')
		.data(dataset)
		.enter()
		.append('g')
		.append('rect')
		.attr('width', barWidth)
		.attr('height', function(d){
			return barHeight * (d.TCGA_AML_FEMALE / 100);
		})
		.attr('x', function(d,i){ return barWidth * i + barPadding * i})
		.style('fill', femaleColor)
		.select(function() {return this.parentNode})
		.append("rect")
		.attr('width', barWidth)
		.attr('height', function(d){
			return barHeight * (d.TCGA_AML_MALE / 100);
		})
		.attr('x', function(d,i){ return barWidth * i + barPadding * i})
		.attr('y', function(d){ 
			return barHeight * (d.TCGA_AML_FEMALE / 100);
		})
		.style('fill', maleColor)
		.select(function() {return this.parentNode});

		item.on('mouseover', function(d){
			addHighlight(this);
		});
		second.on('mouseover', function(d){
			addHighlight(this);
		});
		third.on('mouseover', function(d){
			addHighlight(this);
		});

		item.on('mouseout', function(d){
			removeHighlight(this);
		});
		second.on('mouseout', function(d){
			removeHighlight(this);
		});
		third.on('mouseout', function(d){
			removeHighlight(this);
		});

		item.on('mousedown', function(d){
			updateTooltip(d)
		});
		second.on('mousedown', function(d){
			updateTooltip(d)
		});
		third.on('mousedown', function(d){
			updateTooltip(d)
		});
	});

})();