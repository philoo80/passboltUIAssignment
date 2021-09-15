<div class="page-row features">
	<div class="swiper-container">
		<div class="swiper-wrapper">
			<div class="swiper-slide LU_passwords">
				<h3 class="visuallyhidden">Search and filter on passwords</h3>
			</div>
			<div class="swiper-slide LU_users">
				<h3 class="visuallyhidden">Assign users to groups</h3>
			</div>
			<div class="swiper-slide LU_share">
				<h3 class="visuallyhidden">Share passwords with team members</h3>
			</div>
			<div class="swiper-slide LU_mfa">
				<h3 class="visuallyhidden">Use strong authentication</h3>
			</div>
			<div class="swiper-slide LU_quickaccess">
				<h3 class="visuallyhidden">Never forget a password again</h3>
			</div>
		</div>
	</div>
	<div class="swiper-pagination"></div>
	<div class="swiper-button-prev"></div>
	<div class="swiper-button-next"></div>
</div>
<!-- should go at page bottom -->
<script src="src/js/swiper.jquery.min.js"></script>
<script type="application/javascript">
	$(document).ready(function () {
		var mySwiper = new Swiper ('.swiper-container', {
			// Optional parameters
			direction: 'horizontal',
			pagination: '.swiper-pagination',
			loop: true,
			grabCursor: true,
			keyboardControl: true,
			paginationClickable: true,
			longSwipesRatio:0.2,

			// Navigation arrows
			nextButton: '.swiper-button-next',
			prevButton: '.swiper-button-prev',

		});
	});
</script>
