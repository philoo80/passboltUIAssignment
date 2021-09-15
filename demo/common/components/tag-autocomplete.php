<?php include('../../legacy/_includes/bootstrap.php'); ?><!doctype html>
<head>
    <meta charset="utf-8">
    <title>Vanilla JavaScript autoComplete</title>
    <link rel="stylesheet" type="text/css" href="../../../src/css/themes/<?= $theme; ?>/api_main.css">
    <script src="../../../src/js/autocomplete.js"></script>
</head>
<body>
<div id="container" class="page setup">
    <div class="panel main ">
        <div class="panel middle">
            <div class="grid grid-responsive-12 information">
                <div class="row">
                    <div class="col7">
                        <div class="input text required">
                            <label for="autocomplete">Text input</label>
                            <input id="autocomplete" type="text" name="q" placeholder="Autocomplete" autocomplete="off">
                            <div class="message">Start typing to see suggestions.</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col7">
                        <div class="input text required">
                            <label for="autocomplete">Content editable</label>
                            <div id="autocomplete2" contenteditable="true"
                                style="border:1px solid #CCC;height:1.8em;padding:.25em;width:15em;"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
<script>
  new autoComplete({
    selector: '#autocomplete',
    minChars: 1,
    source: function(term, suggest){
      term = term.toLowerCase();
      var choices = ['Alpha', 'Beta', 'Charlie', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India'];
      var matches = [];
      for (i=0; i<choices.length; i++)
        if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
      suggest(matches);
    }
  });

  new autoComplete({
    selector: '#autocomplete2',
    minChars: 1,
    source: function(term, suggest){
      term = term.toLowerCase();
      var choices = ['Alpha', 'Beta', 'Charlie', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India'];
      var matches = [];
      for (i=0; i<choices.length; i++)
        if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
      suggest(matches);
    }
  });
  </script>
</body>
</html>