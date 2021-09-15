<?php include('_includes/bootstrap.php'); ?><!doctype html>
<html>
<head>
	<?php include('includes/meta/LU_meta_legacy.php'); ?>
	<style>
		#js_perm_create_form_aro_auto_cplt:focus,
		#js_perm_create_form_aro_auto_cplt ~ .security-token {
			background:#ffbbbb;
			color:#000;
		}
		#js_perm_create_form_aro_auto_cplt:focus ~ .security-token {
			background:#000;
			color:#ffbbbb;
		}
	</style>
</head>
<body class="iframe">
<div class="form-content permission-add">
<div class="input text autocomplete with-token">
	<label for="js_perm_create_form_aro_auto_cplt">Add people to share</label>
	<input maxlength="50" id="js_perm_create_form_aro_auto_cplt" placeholder="Start typing a name or email" autocomplete="off" type="text">
	<div class="security-token">CKR</div>
</div>
<div class="input blank">
	<div id="js_perm_create_form_feedback" class="message"></div>
</div>
</div>
<script type="application/javascript">
	resizeIframe('#passbolt-iframe-password-share', {
		width: '100%'
	});
</script>
</body>
</html>
