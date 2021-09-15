<div class="groups accordion sidebar-section">
	<div class="accordion-header">
		<h4><a href="#" role="button">Groups</a></h4>
	</div>

	<ul class="accordion-content">
		<?php if (isset($_GET['empty'])): ?>
			<em>The user is not a member of any group yet.</em>
		<?php else: ?>
			<li class="permission usercard-col-2">
				<div class="content-wrapper">
					<div class="content">
						<div class="name">Human resource</div>
						<div class="subinfo">Member</div>
					</div>
				</div>
				<div class="avatar">
					<img src="src/img/avatar/group_default.png">
				</div>
			</li>
			<li class="permission usercard-col-2">
				<div class="content-wrapper">
					<div class="content">
						<div class="name">IT support</div>
						<div class="subinfo">Group manager</div>
					</div>
				</div>
				<div class="avatar">
					<img src="src/img/avatar/group_default.png">
				</div>
			</li>
		<?php endif;?>
	</ul>
</div>
