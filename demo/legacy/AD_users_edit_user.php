<?php include('_includes/bootstrap.php'); ?><!doctype html>
<html class=" js websqldatabase draganddrop cssscrollbar" lang="en">
<head>
	<?php include('includes/meta/LU_meta.php'); ?>
</head>
<body>
<?php include('includes/nav/LU_nav_tree_groups_contextual_menu.php'); ?>
<div id="container" class="page people">
	<div class="mad_event_event_bus"></div>
	<div id="js_app_controller" class="passbolt_controller_app_controller mad_view_view js_component ready">
		<?php include('includes/dialogs/AD_user_edit.php'); ?>
		<?php include('includes/workspace/LU_users_workspace.php'); ?>
	</div>
</div>
<?php include('includes/LU_footer.php'); ?>
</body>
</html>