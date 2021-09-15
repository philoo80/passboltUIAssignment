<meta charset="utf-8">
<title>Passbolt - The open source password manager for team</title>
<!--
         ____                  __          ____
        / __ \____  _____ ____/ /_  ____  / / /_
       / /_/ / __ `/ ___/ ___/ __ \/ __ \/ / __/
      / ____/ /_/ (__  |__  ) /_/ / /_/ / / /_
     /_/    \__,_/____/____/_.___/\____/_/\__/

    The open source password manager for team
	 (c) 2020 Passbolt SA

-->
<?php if (!isset($base)) { $base = '../../'; } ?>
<base href="<?= $base; ?>">
<meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" type="image/x-icon" href="src/img/webroot/favicon.ico" />
<link rel="icon" href="src/img/webroot/favicon_32.png" sizes="32x32" />
<link rel="icon" href="src/img/webroot/favicon_57.png" sizes="57x57" />
<link rel="icon" href="src/img/webroot/favicon_76.png" sizes="76x76" />
<link rel="icon" href="src/img/webroot/favicon_96.png" sizes="96x96" />
<link rel="icon" href="src/img/webroot/favicon_128.png" sizes="128x128" />
<link rel="icon" href="src/img/webroot/favicon_192.png" sizes="192x192" />
<link rel="icon" href="src/img/webroot/favicon_228.png" sizes="228x228" />
<link rel="stylesheet" type="text/css" href="src/css/themes/<?= $theme; ?>/api_main.css">
<link rel="stylesheet" type="text/css" href="src/css/themes/default/ext_external.css" />
<script src="src/js/jquery-3.5.0.min.js"></script>
<script src="src/js/jquery.tag-editor.js"></script>
<script src="src/js/jquery-ui.min.js"></script>
<script type="application/javascript">
    function resizeElement(selector, dimension) {
        if (typeof dimension.height != 'undefined') {
            $(selector).css('height', dimension.height);
        }
        if (typeof dimension.width != 'undefined') {
            $(selector).css('width', dimension.width);
        }
    }
</script>
<script src="src/js/chosen.jquery.js"></script>