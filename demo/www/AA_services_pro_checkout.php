<!doctype html>
<html class="alpha version no-js" lang="en">
<head>
    <meta charset="utf-8">
    <title>Passbolt | The open source password manager for teams</title>
    <?php include('includes/meta/AA_meta.php'); ?>
	<?php include('includes/headers/AA_header_scripts.php'); ?>
    <script src="src/js/chosen.jquery.js"></script>
</head>
<body>
<div id="container" class="page services featured cart checkout">
    <?php include('includes/headers/AA_header.php'); ?>

<!--    <div class="page-row intro">-->
<!--        <div class="grid grid-responsive-12">-->
<!--            <div class="row">-->
<!--                <div class="col12">-->
<!--                    <h1>Your choice: </h1>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->

    <div class="page-row cart">
        <form class="public">
            <div class="grid grid-responsive-12">
                <div class="row">
                    <div class="col12">
                        <h1>Your order</h1>
                        <p class="message error">This is an error message</p>
                    </div>
                    <div class="col6">
                        <div class="box customer_information">
                            <h2>Billing information</h2>
                            <div class="box-content">
                                <form>
                                    <div class="singleline clearfix">
                                        <div class="input text">
                                            <label for="organization_name">Organization name</label>
                                            <input type="text" id="organization_name" placeholder="Organization name" autocomplete="organization">
                                        </div>
                                        <div class="input text">
                                            <label for="organization_name">Vat number (if any)</label>
                                            <input type="text" id="organization_name" placeholder="Vat number">
                                        </div>
                                    </div>
                                    <div class="input text required error">
                                        <label for="full_name">Full name</label>
                                        <input type="text" id="full_name" placeholder="Full Name" autocomplete="full-name">
                                        <div id="full_name--error" class="message error">This field is required.</div>
                                    </div>
                                    <div class="input text required">
                                        <label for="email_address">Email address</label>
                                        <input type="email" id="email_address" placeholder="Email address" autocomplete="email">
                                    </div>
                                    <div class="input text required">
                                        <label for="organization_address">Address</label>
                                        <input type="text" id="organization_address" placeholder="Address" autocomplete="street-address">
                                    </div>
                                    <div class="singleline clearfix">
                                        <div class="input text required">
                                            <label for="city">City</label>
                                            <input type="text" id="city" placeholder="City" autocomplete="address-level2">
                                        </div>
                                        <div class="input text required">
                                            <label for="zip_code">Zip code</label>
                                            <input type="text" id="zip_code" placeholder="Zip Code" autocomplete="postal-code">
                                        </div>
                                    </div>
                                    <div class="input text required country">
                                        <label for="country">Country</label>
                                        <select name="country" id="country" autocomplete="country-name" data-placeholder="Choose a country" class="chosen-select">
                                        </select>
                                    </div>
                                    <div class="input text vat">
                                        <label for="CustomerOrganizationVat">Vat number</label>
                                        <div class="field-vat">
                                            <span class="country-code">LU</span><input name="data[Customer][organization_vat]" placeholder="not applicable (outside EU)" value="" maxlength="16" type="text" disabled="disabled" id="CustomerOrganizationVat">
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="stripe checkout">
                            <div class="input checkbox terms">
                                <input type="checkbox">
                                <label>I agree to the <a href="#">terms and conditions</a></label>
                            </div>
                            <div class="submit-wrapper clearfix">
                                <a  class="button primary big" >Checkout</a>
                            </div>
                            <!--div class="outcome">
                                <div class="error" role="alert"></div>
                                <div class="success">
                                    Success! Your Stripe token is <span class="token"></span>
                                </div>
                            </div-->
                        </div>
                    </div>
                    <div class="col6 last box payment_info">
                        <h2>Your order</h2>
                        <div class="box-content">
                            <div class="order-line">
                                <div class="item-name">Business pack</div>
                                <div class="input text form-group price">
                                    <select name="products[main][quantity]" id="quantity" class="form-control input-small quantity" required="required">
                                        <?php
                                        for($i = 5; $i < 200; $i+=5) {
                                            ?>
                                            <option value="<?= $i ?>"><?= $i ?></option>
                                        <?php
                                        }
                                        ?>
                                    </select>
                                    <label class="control-label block label-quantity" for="quantity">users</label>
                                </div>
                                <div class="line-total">€240.00</div>
                            </div>
                            <div class="product-details">
                                <ul>
                                    <li>Installation: installation scripts, docker, VM, web installer</li>
                                    <li>Community features: all</li>
                                    <li>Premium features: all</li>
                                    <li>Support: 15 requests, next business day</li>
                                    <li>License validity: forever</li>
                                    <li>Updates: free for one year</li>
                                </ul>
                                <p>After payment, you will receive the installation instructions and license key by email.</p>
                            </div>

                            <div class="voucher">
                                <div class="input text">
                                    <input type="text" placeholder="Any discount code?">
                                    <a href="#" class="button">Apply</a>
                                </div>
                            </div>

                                <div class="subscription-total">
                                    <table class="total-table create">
                                        <tbody>
                                        <tr>
                                            <td class="text-right">Cost:</td>
                                            <td class="text-right cost">
                                                <span class="cost">€240.00</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="text-right">Vat (17%):</td>
                                            <td class="text-right vat">
                                                <span class="vat">€24.00</span>
                                            </td>
                                        </tr>
                                        <tr class="total">
                                            <td class="text-right">Total:</td>
                                            <td class="text-right total-amount">
                                                <span class="order-total-label">€264.00</span>
                                            </td>
                                        </tr>
                                        <tr class="loading">
                                            <td></td>
                                            <td class="loading">
                                                <div class="three-dots-spinner small">
                                                    <div class="bounce1"></div>
                                                    <div class="bounce2"></div>
                                                    <div class="bounce3"></div>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>

    <?php include('includes/footers/AA_footer.php'); ?>

    <script>
        $(function() {
            var countries = {"BD": "Bangladesh", "BE": "Belgium", "BF": "Burkina Faso", "BG": "Bulgaria", "BA": "Bosnia and Herzegovina", "BB": "Barbados", "WF": "Wallis and Futuna", "BL": "Saint Barthelemy", "BM": "Bermuda", "BN": "Brunei", "BO": "Bolivia", "BH": "Bahrain", "BI": "Burundi", "BJ": "Benin", "BT": "Bhutan", "JM": "Jamaica", "BV": "Bouvet Island", "BW": "Botswana", "WS": "Samoa", "BQ": "Bonaire, Saint Eustatius and Saba ", "BR": "Brazil", "BS": "Bahamas", "JE": "Jersey", "BY": "Belarus", "BZ": "Belize", "RU": "Russia", "RW": "Rwanda", "RS": "Serbia", "TL": "East Timor", "RE": "Reunion", "TM": "Turkmenistan", "TJ": "Tajikistan", "RO": "Romania", "TK": "Tokelau", "GW": "Guinea-Bissau", "GU": "Guam", "GT": "Guatemala", "GS": "South Georgia and the South Sandwich Islands", "GR": "Greece", "GQ": "Equatorial Guinea", "GP": "Guadeloupe", "JP": "Japan", "GY": "Guyana", "GG": "Guernsey", "GF": "French Guiana", "GE": "Georgia", "GD": "Grenada", "GB": "United Kingdom", "GA": "Gabon", "SV": "El Salvador", "GN": "Guinea", "GM": "Gambia", "GL": "Greenland", "GI": "Gibraltar", "GH": "Ghana", "OM": "Oman", "TN": "Tunisia", "JO": "Jordan", "HR": "Croatia", "HT": "Haiti", "HU": "Hungary", "HK": "Hong Kong", "HN": "Honduras", "HM": "Heard Island and McDonald Islands", "VE": "Venezuela", "PR": "Puerto Rico", "PS": "Palestinian Territory", "PW": "Palau", "PT": "Portugal", "SJ": "Svalbard and Jan Mayen", "PY": "Paraguay", "IQ": "Iraq", "PA": "Panama", "PF": "French Polynesia", "PG": "Papua New Guinea", "PE": "Peru", "PK": "Pakistan", "PH": "Philippines", "PN": "Pitcairn", "PL": "Poland", "PM": "Saint Pierre and Miquelon", "ZM": "Zambia", "EH": "Western Sahara", "EE": "Estonia", "EG": "Egypt", "ZA": "South Africa", "EC": "Ecuador", "IT": "Italy", "VN": "Vietnam", "SB": "Solomon Islands", "ET": "Ethiopia", "SO": "Somalia", "ZW": "Zimbabwe", "SA": "Saudi Arabia", "ES": "Spain", "ER": "Eritrea", "ME": "Montenegro", "MD": "Moldova", "MG": "Madagascar", "MF": "Saint Martin", "MA": "Morocco", "MC": "Monaco", "UZ": "Uzbekistan", "MM": "Myanmar", "ML": "Mali", "MO": "Macao", "MN": "Mongolia", "MH": "Marshall Islands", "MK": "Macedonia", "MU": "Mauritius", "MT": "Malta", "MW": "Malawi", "MV": "Maldives", "MQ": "Martinique", "MP": "Northern Mariana Islands", "MS": "Montserrat", "MR": "Mauritania", "IM": "Isle of Man", "UG": "Uganda", "TZ": "Tanzania", "MY": "Malaysia", "MX": "Mexico", "IL": "Israel", "FR": "France", "IO": "British Indian Ocean Territory", "SH": "Saint Helena", "FI": "Finland", "FJ": "Fiji", "FK": "Falkland Islands", "FM": "Micronesia", "FO": "Faroe Islands", "NI": "Nicaragua", "NL": "Netherlands", "NO": "Norway", "NA": "Namibia", "VU": "Vanuatu", "NC": "New Caledonia", "NE": "Niger", "NF": "Norfolk Island", "NG": "Nigeria", "NZ": "New Zealand", "NP": "Nepal", "NR": "Nauru", "NU": "Niue", "CK": "Cook Islands", "XK": "Kosovo", "CI": "Ivory Coast", "CH": "Switzerland", "CO": "Colombia", "CN": "China", "CM": "Cameroon", "CL": "Chile", "CC": "Cocos Islands", "CA": "Canada", "CG": "Republic of the Congo", "CF": "Central African Republic", "CD": "Democratic Republic of the Congo", "CZ": "Czech Republic", "CY": "Cyprus", "CX": "Christmas Island", "CR": "Costa Rica", "CW": "Curacao", "CV": "Cape Verde", "CU": "Cuba", "SZ": "Swaziland", "SY": "Syria", "SX": "Sint Maarten", "KG": "Kyrgyzstan", "KE": "Kenya", "SS": "South Sudan", "SR": "Suriname", "KI": "Kiribati", "KH": "Cambodia", "KN": "Saint Kitts and Nevis", "KM": "Comoros", "ST": "Sao Tome and Principe", "SK": "Slovakia", "KR": "South Korea", "SI": "Slovenia", "KP": "North Korea", "KW": "Kuwait", "SN": "Senegal", "SM": "San Marino", "SL": "Sierra Leone", "SC": "Seychelles", "KZ": "Kazakhstan", "KY": "Cayman Islands", "SG": "Singapore", "SE": "Sweden", "SD": "Sudan", "DO": "Dominican Republic", "DM": "Dominica", "DJ": "Djibouti", "DK": "Denmark", "VG": "British Virgin Islands", "DE": "Germany", "YE": "Yemen", "DZ": "Algeria", "US": "United States", "UY": "Uruguay", "YT": "Mayotte", "UM": "United States Minor Outlying Islands", "LB": "Lebanon", "LC": "Saint Lucia", "LA": "Laos", "TV": "Tuvalu", "TW": "Taiwan", "TT": "Trinidad and Tobago", "TR": "Turkey", "LK": "Sri Lanka", "LI": "Liechtenstein", "LV": "Latvia", "TO": "Tonga", "LT": "Lithuania", "LU": "Luxembourg", "LR": "Liberia", "LS": "Lesotho", "TH": "Thailand", "TF": "French Southern Territories", "TG": "Togo", "TD": "Chad", "TC": "Turks and Caicos Islands", "LY": "Libya", "VA": "Vatican", "VC": "Saint Vincent and the Grenadines", "AE": "United Arab Emirates", "AD": "Andorra", "AG": "Antigua and Barbuda", "AF": "Afghanistan", "AI": "Anguilla", "VI": "U.S. Virgin Islands", "IS": "Iceland", "IR": "Iran", "AM": "Armenia", "AL": "Albania", "AO": "Angola", "AQ": "Antarctica", "AS": "American Samoa", "AR": "Argentina", "AU": "Australia", "AT": "Austria", "AW": "Aruba", "IN": "India", "AX": "Aland Islands", "AZ": "Azerbaijan", "IE": "Ireland", "ID": "Indonesia", "UA": "Ukraine", "QA": "Qatar", "MZ": "Mozambique"};
            for(var i in countries) {
                $('#country').append('<option value="' + i + '">' + countries[i] + '</option>');
            }
            $("#country").chosen();
        });
    </script>
</div>
</body>
</html>