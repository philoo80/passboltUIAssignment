<?php include('../../legacy/_includes/bootstrap.php'); ?><!doctype html>
<html lang="en" class="version alpha">
<head>
	<meta charset="UTF-8" />
	<title>Directional Tooltips with CSS</title>
    <link rel="stylesheet" type="text/css" href="../../../src/css/themes/<?= $theme; ?>/api_main.css">
</head>
<body>
<div style="width:640px;margin:auto">
	<h1>Tooltips test</h1>
	<p>Data attribute only <a href="#" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip</code> <a href="#" class="tooltip" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-top</code> <a href="#" class="tooltip-top" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-right</code> <a href="#" class="tooltip-right" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-bottom</code> <a href="#" class="tooltip-bottom" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><a href="#" class="tooltip-left" data-tooltip="I’m the tooltip, yo.">Tooltip</a> <code>.toolbar-left</code></p>
	<br><br>

	<h1>Tooltips test (.always-show)</h1>
	<p><code>.tooltip</code> <a href="#" class="tooltip always-show" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-top</code> <a href="#" class="tooltip-top always-show" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-right</code> <a href="#" class="tooltip-right always-show" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><code>.tooltip-bottom</code> <a href="#" class="tooltip-bottom always-show" data-tooltip="I’m the tooltip, yo.">Tooltip</a></p>
	<p><a href="#" class="tooltip-left always-show" data-tooltip="I’m the tooltip, yo.">Tooltip</a> <code>.toolbar-left</code></p>
	<br><br>

		<h1>Tooltips test (.always-show.large)</h1>	<br><br>
		<div class="clearfix">
			<a href="#" class="button tooltip-left always-show large"
				 data-tooltip="click here to view in clear text">
				<i class="fa fa-eye fa-fw fa-lg"></i>
				<span class="visuallyhidden">view</span>
			</a>
			<a href="#" class="button tooltip-top always-show large"
				 data-tooltip="click here to view in clear text">
				<i class="fa fa-eye fa-fw fa-lg"></i>
				<span class="visuallyhidden">view</span>
			</a>
			<a href="#" class="button tooltip-bottom always-show large"
				 data-tooltip="click here to view in clear text">
				<i class="fa fa-eye fa-fw fa-lg"></i>
				<span class="visuallyhidden">view</span>
			</a>
			<a href="#" class="button tooltip-right always-show large"
				 data-tooltip="click here to view in clear text">
				<i class="fa fa-eye fa-fw fa-lg"></i>
				<span class="visuallyhidden">view</span>
			</a>
			<br><br>	<br><br>

			<h1>Tooltips test (.always-show)</h1>	<br><br>
			<div class="clearfix">
				<a href="#" class="button tooltip-left always-show "
					 data-tooltip="click here to view in clear text">
					<i class="fa fa-eye fa-fw fa-lg"></i>
					<span class="visuallyhidden">view</span>
				</a>
				<a href="#" class="button tooltip-top always-show "
					 data-tooltip="click here to view in clear text">
					<i class="fa fa-eye fa-fw fa-lg"></i>
					<span class="visuallyhidden">view</span>
				</a>
				<a href="#" class="button tooltip-bottom always-show "
					 data-tooltip="click here to view in clear text">
					<i class="fa fa-eye fa-fw fa-lg"></i>
					<span class="visuallyhidden">view</span>
				</a>
				<a href="#" class="button tooltip-right always-show "
					 data-tooltip="click here to view in clear text">
					<i class="fa fa-eye fa-fw fa-lg"></i>
					<span class="visuallyhidden">view</span>
				</a>

			</div>
	<br><br>
			<br><br>
	<a href="http://cbracco.me/a-simple-css-tooltip/">Credit: Chris Bracco</a>
</div>
</body>
</html>