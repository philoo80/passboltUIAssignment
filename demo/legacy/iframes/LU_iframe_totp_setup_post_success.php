<?php include('../_includes/bootstrap.php'); ?>
<?php $base = '../../../'; ?>
<!doctype html>
<html lang="en">
<head>
    <?php include('../includes/meta/LU_meta.php'); ?>
</head>
<body>
<div id="container" class="page iframe mfa">
    <div class="grid grid-responsive-12">
        <div class="row">
            <div class="col7 last">
                <h3>Time based One Time Password (TOTP) is enabled</h3>
                <div class="success success-large message animated">
                    <div class="illustration">
                        <svg id="successAnimation" class="animated" xmlns="http://www.w3.org/2000/svg" width="170" height="170" viewBox="0 0 70 70">
                            <circle id="successAnimationCircle" cx="35" cy="35" r="24" stroke="#000000" stroke-width="3" stroke-linecap="round" fill="transparent"/>
                            <polyline id="successAnimationCheck" stroke="#000000" stroke-width="3" points="23 34 34 43 47 27" linecap="round" fill="transparent"/>
                        </svg>
                    </div>
                    <div class="additional-information">
                        <p>
                            When loggin from a new device or a new location you will need to
                            enter a unique verification code generated by an app on your mobile
                        </p>
                        <p class="created date">
                            Added: Sep 12, 6:45 PM.
                        </p>
                        <p>
                            <a class="button warning " href="demo/legacy/iframes/LU_iframe_mfa_select.php">Turn off</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col7 last">
                <h3>Trusted devices & location</h3>
                <ul class="mfa-trusted-devices">
                    <li class="mfa-trusted-device">
                        <div class="device ">
                            <i class="fa fa-desktop fa-fw"></i>
                            <i class="fa fa-firefox fa-fw"></i>
                        </div>
                        <div class="session">
                            <table>
                                <tr class="created">
                                    <th>Created:</th>
                                    <td>August 28, 2018 @ 12:30</td>
                                </tr>
                                <tr class="agent">
                                    <th>Agent:</th>
                                    <td>Firefox on OS X 10.13</td>
                                </tr>
                            </table>
                        </div>
                        <div class="action">
                            <a href="#delete" class="button cancel" role="button">
                                <i class="fa fa-trash fa-fw"></i>
                                Delete
                            </a>
                        </div>
                    </li>
                    <li class="mfa-trusted-device">
                        <div class="device current">
                            <i class="mobile fa fa-mobile fa-fw"></i>
                            <i class="fa fa-chrome fa-fw"></i>
                        </div>
                        <div class="session">
                            <table>
                                <tr class="created">
                                    <th>Created:</th>
                                    <td>August 27, 2018 @ 11:30</td>
                                </tr>
                                <tr class="agent">
                                    <th>Agent:</th>
                                    <td>Chrome on OS X 10.13</td>
                                </tr>
                            </table>
                        </div>
                        <div class="action">
                            <a href="#delete" class="button cancel" role="button">
                                <i class="fa fa-trash fa-fw"></i>
                                Delete
                            </a>
                        </div>
                    </li>
                    <li class="mfa-trusted-device">
                        <div class="device">
                            <i class="fa fa-desktop fa-fw"></i>
                            <i class="fa fa-chrome fa-fw"></i>
                        </div>
                        <div class="session">
                            <table>
                                <tr class="when">
                                    <th>Created:</th>
                                    <td>August 27, 2018 @ 11:30</td>
                                </tr>
                                <tr class="agent">
                                    <th>Agent:</th>
                                    <td>Chrome on OS X 10.13</td>
                                </tr>
                            </table>
                        </div>
                        <div class="action">
                            <a href="#delete" class="button cancel" role="button">
                                <i class="fa fa-trash fa-fw"></i>
                                Delete
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
</body>
</html>