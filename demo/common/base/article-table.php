<?php include('../../legacy/_includes/bootstrap.php'); ?><!doctype html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Form input tests</title>
    <link rel="stylesheet" type="text/css" href="../../../src/css/themes/<?= $theme; ?>/api_main.css">
</head>
<body>
<div style="width:640px;margin:auto">
	<h1>Table test</h1>

	<article>
		<table class="table-parameters">
			<thead>
                <tr>
                    <th>Parameter</th>
                    <th>Details</th>
                    <th width="300px">Examples</th>
                </tr>
			</thead>
            <tbody>
                <tr>
                    <td>
                        defaultUser<br>
                        <em>(required)</em>
                    </td>
                    <td>
                        Enter here the username of the passbolt admin user that will be used to perform the operations on behalf of the synchronization tools.
                        <br>You can also create a dedicated admin user in passbolt if you want to be able to track more accurately the actions related to ldap.
                    </td>
                    <td>
                        <code>example command 1</code> or <code>example command 2</code>
                    </td>
                </tr>
                <tr>
                    <td>
                        defaultGroupAdminUser<br>
                        <em>(required)</em>
                    </td>
                    <td>
                        Enter here the username of the default group manager. It is the user that will be assigned as a group manager to all new groups created by ldap.
                    </td>
                    <td>
                        <code>example command 1</code> or <code>example command 2</code>
                    </td>
                </tr>
                <tr>
                    <td>
                        fieldsMapping<br>
                        <em>(optional)</em>
                    </td>
                    <td>
                        In case of OpenLdap, the default mapping between the passbolt and directory record fields might not be the one that will work for you. In this section you can redefine the default mapping for your directory:
                    </td>
                    <td><pre>'jobs' =&gt; [
    'users' =&gt; [
        'create' =&gt; true,
        'delete' =&gt; true,
    ],
    'groups' =&gt; [
        'create' =&gt; true,
        'update' =&gt; true,
        'delete' =&gt; true,
    ],
],
</pre></td>
                </tr>
            </tbody>
		</table>
	</article>

</div>

</body>
</html>