<?php include('../../legacy/_includes/bootstrap.php'); ?><!doctype html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Form input tests</title>
    <link rel="stylesheet" type="text/css" href="../../../src/css/themes/<?= $theme; ?>/api_main.css">
</head>
<body>
<div style="width:640px;margin:auto">
	<h1>Form test</h1>

	<form>
		<!-- text input -->
		<div class="input text required">
			<label for="UserUsername">Text input</label>
			<input name="data[User][username]" class="required fluid" maxlength="50" type="text" id="UserUsername" required="required" placeholder="textinput"/>
		</div>

		<!-- text input disabled-->
		<div class="input text required">
			<label for="UserUsername">Text field (disabled)</label>
			<input name="data[User][username]" class="required fluid" disabled="disabled" maxlength="50" type="text" id="UserUsername" required="required" placeholder="textinput (disabled)"/>
		</div>

		<div class="input text required error">
			<label class="error" for="js_field_name">Text field (Error)</label>
			<input name="passbolt.model.Resource.name" class="required error" maxlength="50" id="js_field_name" placeholder="input text error" type="text">
			<div id="js_field_name_feedback" class="message error">Error message for input text</div>
		</div>

		<br>

		<!-- password input -->
		<div class="input password required">
			<label for="UserPassword">Password</label>
			<input name="data[User][password]" class="required fluid" id="UserPassword" required="required" type="password">
		</div>


		<br>

		<!-- text area -->
		<div class="input textarea required">
			<label for="Comment">Textarea</label>
			<textarea name="data[comment][content]" class="required" id="Comment" placeholder="textarea"></textarea>
		</div>

		<!-- text area disabled -->
		<div class="input textarea required">
			<label for="Comment">Textarea (disabled)</label>
			<textarea name="data[comment][content]" class="required" disabled="disabled" id="Comment" placeholder="textarea (disabled)"></textarea>
		</div>

		<!-- select input -->
		<div class="input select">
			<label for="UserField">Select field</label>
			<select name="data[User][field]" id="UserField">
				<option value="">(choose one)</option>
				<option value="0">1</option>
				<option value="1">2</option>
				<option value="2">3</option>
				<option value="3">4</option>
				<option value="4">5</option>
			</select>
		</div>

		<br>

		<label>Checkboxes</label>
		<div class="input checkbox">
			<input type="checkbox" name="data[Color][Color][]" value="5" id="ColorsRed" />
			<label for="ColorsRed">Checkbox</label>
		</div>

		<div class="input checkbox">
			<input type="checkbox" name="data[Color][Color][]" value="5" id="ColorsRed2" disabled="disabled" checked="checked"/>
			<label for="ColorsRed2">Checkbox (disabled)</label>
		</div>

		<br>

		<label>Radios</label>
		<div class="input radio">
			<input name="data[User][field]" type="radio" value="1" id="UserField1" />
			<label for="UserField1">1</label>
			<input name="data[User][field]" type="radio" value="2" id="UserField2" />
			<label for="UserField2">2</label>
		</div>

		<br>

		<a href="#" class="button primary">Button (link primary)</a>
		<div class="submit"><input value="login" type="submit"></div>


	</form>

</div>

</body>
</html>