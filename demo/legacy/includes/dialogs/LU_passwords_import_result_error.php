<div class="dialog-wrapper">
	<div class="dialog import">
		<div class="dialog-header">
			<h2>Something went wrong!</h2>
			<a href="demo/legacy/LU_passwords.php" class="dialog-close" role="button">
			<?php include('includes/svg-icons/close.php'); ?>	
			<span class="visuallyhidden">close</span>
			</a>

		</div>
		<div class="js_dialog_content dialog-content">

			<form
				action="demo/legacy/LU_passwords.php"
				class="tab-content ready selected"
				id="js_rs_import">
				<div class="form-content">

                    <p class="error inline-error">There was an issue when importing the passwords:</p>
					<p>
                        <strong>25 out 28 </strong> passwords have been imported.
                        The newly imported passwords are tagged with: 'import-kdbx-201293494'.
                    </p>
                    <div class="accordion error-details closed">
                        <div class="accordion-header">
                            <a role="link">Errors details</a>
                        </div>
                        <div class="accordion-content hidden">
                            <div class="input text">
                                <label for="js_field_debug" class="visuallyhidden">Errors details</label>
                                <textarea id="js_field_debug">Here the json with errors</textarea>
                            </div>
                        </div>
                    </div>
				</div>
				<div class="submit-wrapper clearfix">
					<input class="button primary" value="OK" type="submit" onclick="javascript:window.location.href='demo/legacy/LU_passwords.php'; return false;">
				</div>
			</form>
		</div>
	</div>
</div>