<?php include('../../legacy/_includes/bootstrap.php'); ?><!doctype html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Form input tests</title>
    <link rel="stylesheet" type="text/css" href="../../../src/css/themes/<?= $theme; ?>/api_main.css">
</head>
<body>
<div style="width:50%;margin:auto; max-width:640px;">
	<h1>Toggle test</h1>
    <div class="input required toggle-switch">
        <label for="cb1">Toggle</label>
        <input class="toggle-switch-checkbox checkbox" id="cb1" type="checkbox">
        <label class="toggle-switch-button" for="cb1"><span>Additional Label 1</span></label>
    </div>
    <div class="input toggle-switch">
        <label for="cb2">Toggle Checked</label>
        <input class="toggle-switch-checkbox checkbox" id="cb2" type="checkbox" checked>
        <label class="toggle-switch-button" for="cb2"><span>Additional Label 2</span></label>
    </div>
    <div class="input disabled toggle-switch">
        <label for="cb3">Toggle Disabled</label>
        <input class="toggle-switch-checkbox checkbox" id="cb3" type="checkbox" disabled>
        <label class="toggle-switch-button" for="cb3"><span>Additional Label 3</span></label>
    </div>
    <div class="input disabled toggle-switch">
        <label for="cb4">Togle Disabled Checked</label>
        <input class="toggle-switch-checkbox checkbox" id="cb4" type="checkbox" disabled checked>
        <label class="toggle-switch-button" for="cb4"><span>Additional Label 4</span></label>
    </div>
</div>
</body>
</html>